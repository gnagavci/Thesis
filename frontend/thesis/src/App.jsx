import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import SimulationDashboard from "./components/SimulationDashboard";
import CreateSimulation from "./components/CreateSimulation";
import { Link } from "react-router-dom";
import "./App.css";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome, {user.username}!</h1>
      <div className="dashboard-actions">
        <Link to="/simulations" className="dashboard-link">
          My Simulations
        </Link>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, login, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Dashboard /> : <Login onLoginSuccess={login} />}
      />
      <Route
        path="/simulations"
        element={user ? <SimulationDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/simulations/new"
        element={user ? <CreateSimulation /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
