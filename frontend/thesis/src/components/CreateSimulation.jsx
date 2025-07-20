import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../utils/api";
import "./CreateSimulation.css";

const CreateSimulation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    mode: "2D",
    substrate: "Oxygen",
    duration: 5,
    decayRate: 0.1,
    divisionRate: 0.1,
    x: 50,
    y: 50,
    z: null,
    tumorCount: 100,
    tumorMovement: "None",
    immuneCount: 0,
    immuneMovement: "None",
    stemCount: 0,
    stemMovement: "None",
    fibroblastCount: 0,
    fibroblastMovement: "None",
    drugCarrierCount: 0,
    drugCarrierMovement: "None",
  });

  const [numberOfSimulations, setNumberOfSimulations] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : isNaN(value) ? value : parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Validate
      if (formData.tumorCount < 1) {
        throw new Error("Tumor count must be at least 1");
      }

      if (numberOfSimulations < 1 || numberOfSimulations > 100) {
        throw new Error("Number of simulations must be between 1 and 100");
      }

      // Call the batch endpoint
      const response = await apiCall("/simulations/create-batch", {
        method: "POST",
        body: JSON.stringify({
          simulationData: formData,
          count: numberOfSimulations,
        }),
      });

      if (response.success) {
        setSuccess(
          `Successfully created and queued ${response.created} simulation(s)`
        );

        // Reset form after 2 seconds and redirect to dashboard
        setTimeout(() => {
          navigate("/simulations");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to create simulations");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="create-simulation">
      {/* Header Navigation */}
      <nav className="simulation-nav">
        <div className="nav-left">
          <Link to="/simulations" className="nav-link">
            Simulation Dashboard
          </Link>
          <Link to="/simulations/new" className="nav-link active create-new">
            Create New Simulation
          </Link>
        </div>

        <div className="nav-right">
          <span className="user-info">Welcome, {user.username}</span>
          <button onClick={logout} className="logout-button-nav">
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="create-content">
        <h1 className="page-title">Create New Simulation</h1>

        <form onSubmit={handleSubmit} className="simulation-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label htmlFor="title">Simulation Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter simulation title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mode">Mode</label>
                <select
                  id="mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="substrate">Substrate</label>
                <select
                  id="substrate"
                  name="substrate"
                  value={formData.substrate}
                  onChange={handleInputChange}
                >
                  <option value="Oxygen">Oxygen</option>
                  <option value="Glucose">Glucose</option>
                  <option value="Nutrients">Nutrients</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  max="1440"
                />
              </div>
            </div>
          </div>

          {/* Simulation Parameters */}
          <div className="form-section">
            <h3>Simulation Parameters</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="decayRate">Decay Rate</label>
                <input
                  type="number"
                  id="decayRate"
                  name="decayRate"
                  value={formData.decayRate}
                  onChange={handleInputChange}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="divisionRate">Division Rate</label>
                <input
                  type="number"
                  id="divisionRate"
                  name="divisionRate"
                  value={formData.divisionRate}
                  onChange={handleInputChange}
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="x">X Dimension</label>
                <input
                  type="number"
                  id="x"
                  name="x"
                  value={formData.x}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="y">Y Dimension</label>
                <input
                  type="number"
                  id="y"
                  name="y"
                  value={formData.y}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                />
              </div>

              {formData.mode === "3D" && (
                <div className="form-group">
                  <label htmlFor="z">Z Dimension</label>
                  <input
                    type="number"
                    id="z"
                    name="z"
                    value={formData.z || 50}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cell Types */}
          <div className="form-section">
            <h3>Cell Types</h3>

            {/* Tumor Cells */}
            <div className="cell-type-section">
              <h4>Tumor Cells</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tumorCount">Count</label>
                  <input
                    type="number"
                    id="tumorCount"
                    name="tumorCount"
                    value={formData.tumorCount}
                    onChange={handleInputChange}
                    min="1"
                    max="10000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tumorMovement">Movement Type</label>
                  <select
                    id="tumorMovement"
                    name="tumorMovement"
                    value={formData.tumorMovement}
                    onChange={handleInputChange}
                  >
                    <option value="None">None</option>
                    <option value="Random">Random</option>
                    <option value="Directed">Directed</option>
                    <option value="Collective">Collective</option>
                    <option value="Flow">Flow</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Immune Cells */}
            <div className="cell-type-section">
              <h4>Immune Cells</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="immuneCount">Count</label>
                  <input
                    type="number"
                    id="immuneCount"
                    name="immuneCount"
                    value={formData.immuneCount}
                    onChange={handleInputChange}
                    min="0"
                    max="10000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="immuneMovement">Movement Type</label>
                  <select
                    id="immuneMovement"
                    name="immuneMovement"
                    value={formData.immuneMovement}
                    onChange={handleInputChange}
                  >
                    <option value="None">None</option>
                    <option value="Random">Random</option>
                    <option value="Directed">Directed</option>
                    <option value="Collective">Collective</option>
                    <option value="Flow">Flow</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional cell types (collapsed by default) */}
            <details className="additional-cells">
              <summary>Additional Cell Types</summary>

              {/* Stem Cells */}
              <div className="cell-type-section">
                <h4>Stem Cells</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="stemCount">Count</label>
                    <input
                      type="number"
                      id="stemCount"
                      name="stemCount"
                      value={formData.stemCount}
                      onChange={handleInputChange}
                      min="0"
                      max="10000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="stemMovement">Movement Type</label>
                    <select
                      id="stemMovement"
                      name="stemMovement"
                      value={formData.stemMovement}
                      onChange={handleInputChange}
                    >
                      <option value="None">None</option>
                      <option value="Random">Random</option>
                      <option value="Directed">Directed</option>
                      <option value="Collective">Collective</option>
                      <option value="Flow">Flow</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fibroblast and Drug Carrier sections similar... */}
            </details>
          </div>

          {/* Batch Configuration */}
          <div className="form-section batch-section">
            <h3>Batch Configuration</h3>
            <div className="form-group">
              <label htmlFor="numberOfSimulations">
                Number of Simulations to Create
              </label>
              <input
                type="number"
                id="numberOfSimulations"
                value={numberOfSimulations}
                onChange={(e) =>
                  setNumberOfSimulations(parseInt(e.target.value) || 1)
                }
                min="1"
                max="100"
              />
              <small>Create multiple identical simulations (1-100)</small>
            </div>
          </div>

          {/* Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Actions */}
          <div className="form-actions">
            <Link to="/simulations" className="cancel-button">
              Cancel
            </Link>
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting
                ? `Creating ${numberOfSimulations} simulation(s)...`
                : `Create ${numberOfSimulations} Simulation${
                    numberOfSimulations > 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSimulation;
