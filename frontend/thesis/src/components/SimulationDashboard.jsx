import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../utils/api";
import "./SimulationDashboard.css";

const SimulationDashboard = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch simulations on component mount
  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall("/simulations");
      setSimulations(data.simulations || []);
    } catch (err) {
      setError(err.message || "Failed to fetch simulations");
      console.error("Error fetching simulations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    // Confirm deletion
    if (
      !window.confirm(`Are you sure you want to delete simulation "${name}"?`)
    ) {
      return;
    }

    try {
      await apiCall(`/simulations/${id}`, { method: "DELETE" });
      // Refetch simulations after successful deletion
      fetchSimulations();
    } catch (err) {
      alert(`Failed to delete simulation: ${err.message}`);
      console.error("Error deleting simulation:", err);
    }
  };

  const handleCheckResults = (simulation) => {
    // Stub for future implementation
    console.log("Check results for simulation:", simulation);
  };

  if (!user) {
    return null; // Don't render while redirecting
  }

  return (
    <div className="simulation-dashboard">
      {/* Header Navigation */}
      <nav className="simulation-nav">
        <Link to="/simulations" className="nav-link active">
          Simulation Dashboard
        </Link>
        <Link to="/simulations/new" className="nav-link create-new">
          Create New Simulation
        </Link>
      </nav>

      {/* Page Content */}
      <div className="dashboard-content">
        <h1 className="page-title">My Simulations</h1>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading simulations...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-container">
            <p className="error-message">Error: {error}</p>
            <button onClick={fetchSimulations} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && simulations.length === 0 && (
          <div className="empty-state">
            <p>You haven't created any simulations yet.</p>
            <Link to="/simulations/new" className="create-first-link">
              Create your first simulation
            </Link>
          </div>
        )}

        {/* Simulations Grid */}
        {!loading && !error && simulations.length > 0 && (
          <div className="simulations-grid">
            {simulations.map((simulation) => (
              <div key={simulation.id} className="simulation-card">
                <h3 className="simulation-name">
                  {simulation.title || "Untitled Simulation"}
                </h3>

                <div className="simulation-details">
                  <p>
                    <span className="label">ID:</span> {simulation.id}
                  </p>
                  <p>
                    <span className="label">Mode:</span> {simulation.mode}
                  </p>
                  <p>
                    <span className="label">Substrate:</span>{" "}
                    {simulation.substrate}
                  </p>
                  <p>
                    <span className="label">Running Time:</span>{" "}
                    {simulation.duration} minutes
                  </p>
                  <p>
                    <span className="label">Status:</span>
                    <span
                      className={`status status-${simulation.status.toLowerCase()}`}
                    >
                      {simulation.status}
                    </span>
                  </p>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() =>
                      handleDelete(simulation.id, simulation.title)
                    }
                    className="delete-button"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleCheckResults(simulation)}
                    className="results-button"
                    disabled={simulation.status !== "Done"}
                  >
                    Check Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationDashboard;
