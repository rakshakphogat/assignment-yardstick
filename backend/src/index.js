import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://rakshakphogat_db_user:OeySKBa7OQtjzKzb@cluster0.tjhnlcr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://assignment-yardstick-eight.vercel.app', 'https://yardstick-frontend-omega.vercel.app'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const TenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
    createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In production, hash this!
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    createdAt: { type: Date, default: Date.now }
});

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Tenant = mongoose.model('Tenant', TenantSchema);
const User = mongoose.model('User', UserSchema);
const Note = mongoose.model('Note', NoteSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    // Extract token from cookie (parsed by cookie-parser)
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            hint: 'Please login to get authentication cookie'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('tenantId');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Invalid token',
            hint: 'Please login again'
        });
    }
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin role required' });
    }
    next();
};

// Routes
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Multi-Tenant SaaS Notes API',
        status: 'running',
        endpoints: {
            health: '/health',
            login: 'POST /auth/login',
            notes: 'GET/POST/PUT/DELETE /notes'
        }
    });
});

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('tenantId');
        if (!user || user.password !== password) { // In production, use proper password hashing
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        // Set HTTP-only cookie for authentication
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                tenant: {
                    id: user.tenantId._id,
                    name: user.tenantId.name,
                    slug: user.tenantId.slug,
                    subscription: user.tenantId.subscription
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user endpoint
app.get('/auth/me', authenticateToken, (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role,
            tenant: {
                id: req.user.tenantId._id,
                name: req.user.tenantId.name,
                slug: req.user.tenantId.slug,
                subscription: req.user.tenantId.subscription
            }
        }
    });
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Notes CRUD endpoints
app.post('/notes', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;

        // Check subscription limits for free plan
        if (req.user.tenantId.subscription === 'free') {
            const noteCount = await Note.countDocuments({ tenantId: req.user.tenantId._id });
            if (noteCount >= 3) {
                return res.status(403).json({
                    error: 'Free plan limit reached. Upgrade to Pro for unlimited notes.',
                    code: 'SUBSCRIPTION_LIMIT_REACHED'
                });
            }
        }

        const note = await Note.create({
            title,
            content,
            tenantId: req.user.tenantId._id,
            userId: req.user._id
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/notes', authenticateToken, async (req, res) => {
    try {
        const notes = await Note.find({ tenantId: req.user.tenantId._id })
            .populate('userId', 'email')
            .sort({ createdAt: -1 });
        console.log(notes)
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId._id
        }).populate('userId', 'email');

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId._id },
            { title, content, updatedAt: new Date() },
            { new: true }
        );

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            tenantId: req.user.tenantId._id
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Tenant upgrade endpoint
app.post('/tenants/:slug/upgrade', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (req.user.tenantId.slug !== req.params.slug) {
            return res.status(403).json({ error: 'Cannot upgrade other tenants' });
        }

        const tenant = await Tenant.findByIdAndUpdate(
            req.user.tenantId._id,
            { subscription: 'pro' },
            { new: true }
        );

        res.json({
            message: 'Tenant upgraded to Pro successfully',
            tenant: {
                id: tenant._id,
                name: tenant.name,
                slug: tenant.slug,
                subscription: tenant.subscription
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;