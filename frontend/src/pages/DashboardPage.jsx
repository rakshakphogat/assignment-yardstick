import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://yardstick-backend-sandy.vercel.app";

const DashboardPage = ({ user, setUser }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchNotes();
  }, [user, navigate]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/notes`, {
        withCredentials: true,
      });
      setNotes(response.data);
    } catch (error) {
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/notes/${id}`, {
        withCredentials: true,
      });
      setNotes(notes.filter((note) => note._id !== id));
      setSuccess("Note deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const upgradeTenant = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${API_BASE_URL}/tenants/${user.tenant.slug}/upgrade`,
        {},
        {
          withCredentials: true,
        }
      );
      const updatedUser = {
        ...user,
        tenant: { ...user.tenant, subscription: "pro" },
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("Successfully upgraded to Pro!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to upgrade subscription");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  const isAtLimit = user.tenant.subscription === "free" && notes.length >= 3;
  const showUpgradeBanner =
    user.tenant.subscription === "free" && (isAtLimit || notes.length >= 2);

  return (
    <div className="container">
      <div className="header">
        <h1>Notes SaaS - {user.tenant.name}</h1>
        <div className="user-info">
          <span>
            {user.email} ({user.role})
          </span>
          <span className={`subscription-badge ${user.tenant.subscription}`}>
            {user.tenant.subscription}
          </span>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showUpgradeBanner && user.role === "admin" && (
        <div className="upgrade-banner">
          <h3>Upgrade to Pro</h3>
          <p>Get unlimited notes and advanced features</p>
          <button
            className="btn btn-success"
            onClick={upgradeTenant}
            disabled={loading}
          >
            Upgrade Now
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Your Notes ({notes.length})</h2>
        {!isAtLimit && (
          <Link to="/notes/create" className="btn">
            Add Note
          </Link>
        )}
      </div>

      {loading && <div>Loading...</div>}

      {notes.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No notes yet.{" "}
          {isAtLimit
            ? "Upgrade to Pro to create unlimited notes!"
            : "Create your first note!"}
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <small style={{ color: "#999" }}>
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </small>
              <div className="note-actions" style={{ marginTop: "15px" }}>
                <Link to={`/notes/edit/${note._id}`} className="btn">
                  Edit
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteNote(note._id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
