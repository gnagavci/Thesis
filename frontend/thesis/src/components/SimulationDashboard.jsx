import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../utils/api";
import { usePolling } from "../hooks/usePolling";
import "./SimulationDashboard.css";

const SimulationDashboard = () => {
  const [simulations, setSimulations] = useState([]);
  const [manualLoading, setManualLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStrategy, setUpdateStrategy] = useState("polling");
  const [pollingInterval, setPollingInterval] = useState(5000);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Memoize the fetch function to prevent recreating it
  const fetchSimulations = useCallback(async () => {
    if (!user) return null;

    try {
      const data = await apiCall("/simulations");
      return data.simulations || [];
    } catch (error) {
      console.error("Error in fetchSimulations:", error);
      throw error;
    }
  }, [user]);

  // Manual fetch for initial load
  const manualFetch = useCallback(async () => {
    try {
      setManualLoading(true);
      setError(null);
      const data = await fetchSimulations();
      setSimulations(data);
    } catch (err) {
      setError(err.message || "Failed to fetch simulations");
      console.error("Error fetching simulations:", err);
    } finally {
      setManualLoading(false);
    }
  }, [fetchSimulations]);

  // Memoize polling options to prevent recreating them
  const pollingOptions = useMemo(
    () => ({
      interval: pollingInterval,
      enabled: updateStrategy === "polling" && !manualLoading && !!user,
      onSuccess: (data) => {
        if (data) {
          setSimulations(data);
        }
      },
      onError: (err) => {
        console.error("Polling error:", err);
        setError(err.message || "Polling failed");
      },
    }),
    [pollingInterval, updateStrategy, manualLoading, user]
  );

  // Use polling hook for live updates
  const {
    data: polledData,
    error: pollingError,
    loading: pollingLoading,
    refetch,
  } = usePolling(fetchSimulations, pollingOptions);

  // Initial load
  useEffect(() => {
    if (user) {
      manualFetch();
    }
  }, [user, manualFetch]);

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(`Are you sure you want to delete simulation "${name}"?`)
    ) {
      return;
    }

    try {
      await apiCall(`/simulations/${id}`, { method: "DELETE" });
      // Immediately update local state
      setSimulations((prev) => prev.filter((sim) => sim.id !== id));
      // Trigger a refetch to ensure consistency
      if (updateStrategy === "polling") {
        refetch();
      }
    } catch (err) {
      alert(`Failed to delete simulation: ${err.message}`);
      console.error("Error deleting simulation:", err);
    }
  };

  const handleCheckResults = (simulation) => {
    console.log("Check results for simulation:", simulation);
    // TODO: Implement results modal
  };

  const toggleUpdateStrategy = () => {
    setUpdateStrategy((prev) => (prev === "polling" ? "manual" : "polling"));
  };

  if (!user) {
    return null;
  }

  const displayError =
    error ||
    (pollingError && updateStrategy === "polling"
      ? pollingError.message
      : null);
  const isLoading = manualLoading;

  return (
    <div className="simulation-dashboard">
      {/* Header Navigation */}
      <nav className="simulation-nav">
        <div className="nav-left">
          <Link to="/simulations" className="nav-link active">
            Simulation Dashboard
          </Link>
          <Link to="/simulations/new" className="nav-link create-new">
            Create New Simulation
          </Link>
        </div>

        <div className="nav-right">
          <div className="update-controls">
            <button
              onClick={toggleUpdateStrategy}
              className={`update-strategy-toggle ${updateStrategy}`}
            >
              {updateStrategy === "polling"
                ? "🔄 Live Updates ON"
                : "⏸️ Live Updates OFF"}
            </button>
            {updateStrategy === "polling" && (
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(Number(e.target.value))}
                className="polling-interval-select"
              >
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            )}
          </div>
          <span className="user-info">Welcome, {user.username}</span>
          <button onClick={logout} className="logout-button-nav">
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="page-title">My Simulations</h1>
          {updateStrategy === "polling" && !isLoading && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              Live Updates Active
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading simulations...</p>
          </div>
        )}

        {/* Error State */}
        {displayError && !isLoading && (
          <div className="error-container">
            <p className="error-message">Error: {displayError}</p>
            <button onClick={manualFetch} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !displayError && simulations.length === 0 && (
          <div className="empty-state">
            <p>You haven't created any simulations yet.</p>
            <Link to="/simulations/new" className="create-first-link">
              Create your first simulation
            </Link>
          </div>
        )}

        {/* Simulations Grid */}
        {!isLoading && !displayError && simulations.length > 0 && (
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
