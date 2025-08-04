import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../utils/api";
import SimulationTemplates, {
  SIMULATION_TEMPLATES,
  AVAILABLE_FIELDS,
} from "./SimulationTemplates";
import ImportSimulationModal from "./ImportSimulationModal";
import {
  FaPlus,
  FaSignOutAlt,
  FaUpload,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaFlask,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoFlask } from "react-icons/io5";
import "./CreateSimulation.css";

const CreateSimulation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [selectedTemplate, setSelectedTemplate] = useState("basic");
  const [selectedFields, setSelectedFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [numberOfSimulations, setNumberOfSimulations] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New state for import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Apply template when selection changes
  useEffect(() => {
    if (selectedTemplate === "custom") {
      // For custom, start with only required fields selected
      const requiredFields = Object.entries(AVAILABLE_FIELDS)
        .filter(([_, field]) => field.required)
        .map(([fieldName, _]) => fieldName);

      setSelectedFields(requiredFields);

      // Set default values for required fields
      const defaults = {};
      requiredFields.forEach((fieldName) => {
        defaults[fieldName] = AVAILABLE_FIELDS[fieldName].default;
      });
      setFormData(defaults);
    } else if (SIMULATION_TEMPLATES[selectedTemplate]) {
      // Apply template defaults
      const template = SIMULATION_TEMPLATES[selectedTemplate];
      const templateData = {};
      const templateFields = [];

      Object.entries(template.fields).forEach(([key, field]) => {
        templateData[key] = field.default;
        templateFields.push(key);
      });

      setFormData(templateData);
      setSelectedFields(templateFields);
    }
  }, [selectedTemplate]);

  const handleFieldToggle = (fieldName) => {
    const field = AVAILABLE_FIELDS[fieldName];
    if (field.required) return; // Can't toggle required fields

    if (selectedFields.includes(fieldName)) {
      // Remove field
      setSelectedFields((prev) => prev.filter((f) => f !== fieldName));
      // Remove from formData
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData[fieldName];
        return newData;
      });
    } else {
      // Add field
      setSelectedFields((prev) => [...prev, fieldName]);
      // Add to formData with default value
      setFormData((prev) => ({
        ...prev,
        [fieldName]: field.default,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const field = AVAILABLE_FIELDS[name];

    let processedValue = value;
    if (field.type === "number" && value !== "") {
      processedValue = parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = Object.entries(AVAILABLE_FIELDS)
        .filter(([_, field]) => field.required)
        .map(([fieldName, _]) => fieldName);

      for (const reqField of requiredFields) {
        if (
          !formData[reqField] ||
          (reqField === "tumorCount" && formData[reqField] < 1)
        ) {
          throw new Error(`${AVAILABLE_FIELDS[reqField].label} is required`);
        }
      }

      if (numberOfSimulations < 1 || numberOfSimulations > 100) {
        throw new Error("Number of simulations must be between 1 and 100");
      }

      // Build final data with defaults for unselected fields
      const finalData = {};
      Object.entries(AVAILABLE_FIELDS).forEach(([fieldName, field]) => {
        if (formData.hasOwnProperty(fieldName)) {
          finalData[fieldName] = formData[fieldName];
        } else {
          finalData[fieldName] = field.default;
        }
      });

      // Call the batch endpoint
      const response = await apiCall("/simulations/create-batch", {
        method: "POST",
        body: JSON.stringify({
          simulationData: finalData,
          count: numberOfSimulations,
          template: selectedTemplate,
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

  // New handlers for import functionality
  const handleImportSuccess = (importedCount) => {
    setImportMessage(
      `Successfully imported ${importedCount} simulation${
        importedCount > 1 ? "s" : ""
      }!`
    );
    setTimeout(() => {
      navigate("/simulations");
    }, 2000);
  };

  const handleImportClose = () => {
    setShowImportModal(false);
  };

  const renderField = (fieldName) => {
    const field = AVAILABLE_FIELDS[fieldName];
    if (!field) return null;

    // Check dependencies
    if (field.dependsOn) {
      const dependsOnValue = formData[field.dependsOn.field];
      if (dependsOnValue !== field.dependsOn.value) {
        return null;
      }
    }

    return (
      <div key={fieldName} className="form-group">
        <label htmlFor={fieldName}>
          {field.label}
          {field.required && <span className="required"> *</span>}
        </label>

        {field.type === "select" ? (
          <select
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || field.default || ""}
            onChange={handleInputChange}
            required={field.required}
            className="form-input"
          >
            {!field.required && <option value="">None</option>}
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            id={fieldName}
            name={fieldName}
            value={
              formData[fieldName] !== null && formData[fieldName] !== undefined
                ? formData[fieldName]
                : ""
            }
            onChange={handleInputChange}
            min={field.min}
            max={field.max}
            step={field.step}
            required={field.required}
            className="form-input"
          />
        )}
      </div>
    );
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
            <MdDashboard className="nav-icon" />
            <span className="nav-text">Simulation Dashboard</span>
          </Link>
          <Link to="/simulations/new" className="nav-link active create-new">
            <FaPlus className="nav-icon" />
            <span className="nav-text">Create New Simulation</span>
          </Link>
        </div>

        <div className="nav-right">
          <span className="user-info">
            <span className="welcome-text">Welcome, {user.username}</span>
          </span>
          <button onClick={logout} className="logout-button-nav">
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
            Create New Simulation
          </h1>
          <div className="header-actions">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="import-button"
              disabled={submitting}
            >
              <FaUpload className="import-icon" />
              <span className="import-text">Import from File</span>
            </button>
          </div>
        </div>

        {/* Import success message */}
        {importMessage && (
          <div className="message success-message">
            <FaCheckCircle className="message-icon" />
            <span className="message-text">{importMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="simulation-form">
          {/* Template Selection */}
          <div className="form-section">
            <SimulationTemplates
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
              selectedFields={selectedFields}
              onFieldToggle={handleFieldToggle}
            />
          </div>

          {/* Form Fields */}
          <div className="form-section">
            <div className="section-header">
              <FaFlask className="section-icon" />
              <h3 className="section-title">Simulation Parameters</h3>
            </div>
            <div className="template-fields">
              {selectedFields.map((fieldName) => renderField(fieldName))}
            </div>
            {selectedFields.length === 0 && (
              <div className="empty-state">
                <IoFlask className="empty-icon" />
                <p className="empty-text">
                  Please select fields from the template above.
                </p>
              </div>
            )}
          </div>

          {/* Batch Configuration */}
          <div className="form-section batch-section">
            <div className="section-header">
              <FaFlask className="section-icon" />
              <h3 className="section-title">Batch Configuration</h3>
            </div>
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
                className="form-input"
              />
              <small className="form-help">
                Create multiple identical simulations (1-100)
              </small>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="message error-message">
              <FaExclamationTriangle className="message-icon" />
              <span className="message-text">{error}</span>
            </div>
          )}
          {success && (
            <div className="message success-message">
              <FaCheckCircle className="message-icon" />
              <span className="message-text">{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <Link to="/simulations" className="cancel-button">
              <FaTimes className="button-icon" />
              <span className="button-text">Cancel</span>
            </Link>
            <button
              type="submit"
              className="submit-button"
              disabled={
                submitting ||
                (selectedTemplate === "custom" && selectedFields.length === 0)
              }
            >
              {submitting ? (
                <>
                  <FaSpinner className="spinner button-icon" />
                  <span className="button-text">
                    Creating {numberOfSimulations} simulation(s)...
                  </span>
                </>
              ) : (
                <>
                  <FaPlus className="button-icon" />
                  <span className="button-text">
                    Create {numberOfSimulations} Simulation
                    {numberOfSimulations > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Import Modal */}
        <ImportSimulationModal
          isOpen={showImportModal}
          onClose={handleImportClose}
          onSuccess={handleImportSuccess}
        />
      </div>
    </div>
  );
};

export default CreateSimulation;
