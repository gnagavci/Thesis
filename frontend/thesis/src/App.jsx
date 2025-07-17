import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import SimulationDashboard from "./components/SimulationDashboard";
import CreateSimulation from "./components/CreateSimulation";
import "./App.css";

const AppContent = () => {
  const { user, login, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      {/* Root path - if logged in, redirect to simulations */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/simulations" replace />
          ) : (
            <Login onLoginSuccess={login} />
          )
        }
      />

      {/* Simulations dashboard - main page after login */}
      <Route
        path="/simulations"
        element={user ? <SimulationDashboard /> : <Navigate to="/" />}
      />

      {/* Create new simulation */}
      <Route
        path="/simulations/new"
        element={user ? <CreateSimulation /> : <Navigate to="/" />}
      />

      {/* Catch all - redirect to simulations if logged in, otherwise to login */}
      <Route
        path="*"
        element={<Navigate to={user ? "/simulations" : "/"} replace />}
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
