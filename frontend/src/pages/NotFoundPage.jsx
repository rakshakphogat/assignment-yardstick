import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="container">
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{ fontSize: "72px", color: "#007bff", margin: "0 0 20px 0" }}
        >
          404
        </h1>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Page Not Found</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/dashboard" className="btn">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
