import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.REACT_APP_API_URL ||
  "https://yardstick-backend-sandy.vercel.app";

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState("admin@acme.test");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const predefinedAccounts = [
    { email: "admin@acme.test", label: "Acme Admin" },
    { email: "user@acme.test", label: "Acme User" },
    { email: "admin@globex.test", label: "Globex Admin" },
    { email: "user@globex.test", label: "Globex User" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      const { user } = response.data;

      // No localStorage - cookies handle authentication
      setUser(user);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-form">
        <h2>Notes SaaS Login</h2>
        {error && <div className="error">{error}</div>}

        <div style={{ marginBottom: "20px" }}>
          <label>Quick Login (Demo Accounts):</label>
          {predefinedAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              className="btn"
              style={{
                width: "100%",
                marginBottom: "5px",
                fontSize: "14px",
                padding: "8px",
              }}
              onClick={() => {
                setEmail(account.email);
                setPassword("password");
              }}
            >
              {account.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
          }}
        >
          All demo accounts use password: <strong>password</strong>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
