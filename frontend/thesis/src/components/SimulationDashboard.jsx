import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../utils/api";
import { usePolling } from "../hooks/usePolling";
import SimulationResultsModal from "./SimulationResultsModal";
import {
  FaPlay,
  FaPause,
  FaPlus,
  FaSignOutAlt,
  FaTrashAlt,
  FaChartLine,
  FaSpinner,
  FaExclamationTriangle,
  FaRedo,
  FaTachometerAlt,
  FaCircle,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoFlask } from "react-icons/io5";
import "./SimulationDashboard.css";

const SimulationDashboard = () => {
  const [simulations, setSimulations] = useState([]);
  const [manualLoading, setManualLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStrategy, setUpdateStrategy] = useState("polling");
  const [pollingInterval, setPollingInterval] = useState(5000);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Add the missing handleCheckResults function
  const handleCheckResults = (simulation) => {
    console.log("Opening modal for simulation:", simulation);
    setSelectedSimulation(simulation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSimulation(null);
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
            <MdDashboard className="nav-icon" />
            <span className="nav-text">Simulation Dashboard</span>
          </Link>
          <Link to="/simulations/new" className="nav-link create-new">
            <FaPlus className="nav-icon" />
            <span className="nav-text">Create New Simulation</span>
          </Link>
        </div>

        <div className="nav-right">
          <div className="update-controls">
            <button
              onClick={toggleUpdateStrategy}
              className={`update-strategy-toggle ${updateStrategy}`}
              aria-label={`Turn live updates ${
                updateStrategy === "polling" ? "off" : "on"
              }`}
            >
              {updateStrategy === "polling" ? (
                <>
                  <FaPlay className="toggle-icon" />
                  <span className="toggle-text">Live Updates ON</span>
                </>
              ) : (
                <>
                  <FaPause className="toggle-icon" />
                  <span className="toggle-text">Live Updates OFF</span>
                </>
              )}
            </button>
            {updateStrategy === "polling" && (
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(Number(e.target.value))}
                className="polling-interval-select"
                aria-label="Select polling interval"
              >
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            )}
          </div>
          <span className="user-info">
            <span className="welcome-text">Welcome, {user.username}</span>
          </span>
          <button
            onClick={logout}
            className="logout-button-nav"
            aria-label="Logout"
          >
            <FaSignOutAlt className="logout-icon" />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="page-title">
            <IoFlask className="title-icon" />
            My Simulations
          </h1>
          {updateStrategy === "polling" && !isLoading && (
            <div className="live-indicator">
              <FaCircle className="live-dot" />
              <span className="live-text">Live Updates Active</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Loading simulations...</p>
          </div>
        )}

        {/* Error State */}
        {displayError && !isLoading && (
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <p className="error-message">Error: {displayError}</p>
            <button onClick={manualFetch} className="retry-button">
              <FaRedo className="retry-icon" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !displayError && simulations.length === 0 && (
          <div className="empty-state">
            <IoFlask className="empty-icon" />
            <p>You haven't created any simulations yet.</p>
            <Link to="/simulations/new" className="create-first-link">
              <FaPlus className="create-icon" />
              Create your first simulation
            </Link>
          </div>
        )}

        {/* Simulations Grid */}
        {!isLoading && !displayError && simulations.length > 0 && (
          <div className="simulations-grid">
            {simulations.map((simulation) => (
              <div key={simulation.id} className="simulation-card">
                <div className="card-header">
                  <h3 className="simulation-name">
                    {simulation.title || "Untitled Simulation"}
                  </h3>
                  <span
                    className={`status status-${simulation.status.toLowerCase()}`}
                  >
                    {simulation.status}
                  </span>
                </div>

                <div className="simulation-details">
                  <div className="detail-row">
                    <span className="label">ID:</span>
                    <span className="value">{simulation.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Mode:</span>
                    <span className="value">{simulation.mode}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Substrate:</span>
                    <span className="value">{simulation.substrate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">{simulation.duration} minutes</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() =>
                      handleDelete(simulation.id, simulation.title)
                    }
                    className="delete-button"
                    aria-label={`Delete ${simulation.title || "simulation"}`}
                  >
                    <FaTrashAlt className="action-icon" />
                    <span className="action-text">Delete</span>
                  </button>
                  <button
                    onClick={() => handleCheckResults(simulation)}
                    className="results-button"
                    disabled={simulation.status !== "Done"}
                    aria-label={`View results for ${
                      simulation.title || "simulation"
                    }`}
                  >
                    <FaChartLine className="action-icon" />
                    <span className="action-text">Check Results</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSimulation && (
        <SimulationResultsModal
          simulationId={selectedSimulation.id}
          simulation={selectedSimulation}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SimulationDashboard;
