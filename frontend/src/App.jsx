import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NoteFormPage from "./pages/NoteFormPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Components
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios and check for existing user on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(userStr));
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage setUser={setUser} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <DashboardPage user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes/create"
          element={
            <ProtectedRoute user={user}>
              <NoteFormPage user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes/edit/:id"
          element={
            <ProtectedRoute user={user}>
              <NoteFormPage user={user} />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
