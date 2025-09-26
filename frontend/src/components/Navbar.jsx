import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  if (!user) return null;

  return (
    <nav
      style={{
        background: "#007bff",
        padding: "10px 20px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
        }}
      >
        <div>
          <Link
            to="/dashboard"
            style={{
              color: "white",
              textDecoration: "none",
              marginRight: "20px",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/notes/create"
            style={{ color: "white", textDecoration: "none" }}
          >
            New Note
          </Link>
        </div>
        <div>
          <span style={{ marginRight: "20px" }}>
            {user.email} - {user.tenant.name} ({user.tenant.subscription})
          </span>
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: "1px solid white",
              color: "white",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
