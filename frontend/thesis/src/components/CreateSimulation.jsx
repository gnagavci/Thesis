import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./CreateSimulation.css";

const CreateSimulation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Don't render while redirecting
  }

  return (
    <div className="create-simulation">
      {/* Header Navigation */}
      <nav className="simulation-nav">
        <Link to="/simulations" className="nav-link">
          Simulation Dashboard
        </Link>
        <Link to="/simulations/new" className="nav-link active create-new">
          Create New Simulation
        </Link>
      </nav>

      {/* Page Content */}
      <div className="create-content">
        <h1 className="page-title">Create New Simulation</h1>

        <div className="coming-soon">
          <div className="icon">🚧</div>
          <h2>Coming Soon</h2>
          <p>The simulation creation feature is currently under development.</p>
          <p>Check back later for exciting new functionality!</p>

          <Link to="/simulations" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateSimulation;
