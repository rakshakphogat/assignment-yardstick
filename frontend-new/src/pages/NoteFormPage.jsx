import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:3001";

const NoteFormPage = ({ user }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const fetchNote = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/notes/${id}`, {
        withCredentials: true,
      });
      const note = response.data;
      setTitle(note.title);
      setContent(note.content);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch note");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isEditing) {
      fetchNote();
    }
  }, [user, navigate, isEditing, id, fetchNote]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const config = {
        withCredentials: true,
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/notes/${id}`,
          { title, content },
          config
        );
        setSuccess("Note updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/notes`, { title, content }, config);
        setSuccess("Note created successfully!");
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      if (error.response?.data?.code === "SUBSCRIPTION_LIMIT_REACHED") {
        setError(error.response.data.error);
      } else {
        setError(`Failed to ${isEditing ? "update" : "create"} note`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

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
          <button className="btn btn-secondary" onClick={handleCancel}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="note-form">
        <h3>{isEditing ? "Edit Note" : "Create New Note"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
              style={{ minHeight: "200px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Note"
                : "Create Note"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteFormPage;
