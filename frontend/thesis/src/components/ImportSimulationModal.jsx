import { useState, useRef } from "react";
import {
  FaTimes,
  FaUpload,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFileAlt,
  FaDatabase,
} from "react-icons/fa";
import { IoFlask } from "react-icons/io5";
import SimulationSchema from "../schemas/simulationSchema";
import "./ImportSimulationModal.css";

function ImportSimulationModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [count, setCount] = useState(1);
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check file size (1MB limit)
      if (selectedFile.size > 1024 * 1024) {
        setErrors(["File size must be less than 1MB"]);
        return;
      }

      // Check file type
      if (!selectedFile.name.endsWith(".json")) {
        setErrors(["Please select a JSON file"]);
        return;
      }

      setFile(selectedFile);
      setErrors([]);
    }
  };

  const validateJsonContent = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Basic validation - just check if it parses and has required fields
      if (
        !data.title ||
        !data.mode ||
        !data.substrate ||
        !data.duration ||
        !data.tumorCount
      ) {
        return {
          isValid: false,
          errors: [
            "Missing required fields: title, mode, substrate, duration, tumorCount",
          ],
        };
      }

      return { isValid: true, data };
    } catch (error) {
      if (error.name === "SyntaxError") {
        return { isValid: false, errors: ["Invalid JSON format"] };
      }

      return { isValid: false, errors: [error.message] };
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrors(["Please select a file"]);
      return;
    }

    if (count < 1 || count > 1000) {
      setErrors(["Number of simulations must be between 1 and 1000"]);
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      // Client-side validation
      const validation = await validateJsonContent(file);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsUploading(false);
        return;
      }

      // Step 1: Validate the file with the import endpoint
      const formData = new FormData();
      formData.append("file", file);
      formData.append("count", String(count));

      const token = localStorage.getItem("token");

      const importResponse = await fetch("/api/simulations/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const importResult = await importResponse.json();

      if (!importResponse.ok) {
        if (importResult.errors) {
          setErrors(
            importResult.errors.map((err) => err.msg || err.message || err)
          );
        } else {
          setErrors([importResult.message || "Validation failed"]);
        }
        return;
      }

      // Step 2: Use the validated data to create simulations via existing endpoint
      const simulationData = importResult.simulationData;

      const createResponse = await fetch("/api/simulations/create-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          simulationData: simulationData,
          count: count,
          template: "imported",
        }),
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        setErrors([
          createResult.error ||
            createResult.message ||
            "Failed to create simulations",
        ]);
        return;
      }

      // Success!
      console.log("Import successful:", createResult);
      onSuccess(createResult.created || count);
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
      setErrors(["Network error. Please try again."]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCount(1);
    setErrors([]);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleBackdropClick} />
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title-section">
              <FaUpload className="modal-title-icon" />
              <h2 className="modal-title">Import Simulation from File</h2>
            </div>
            <button className="modal-close" onClick={handleClose}>
              <FaTimes />
            </button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="file-input" className="form-label">
                <FaFileAlt className="label-icon" />
                Select JSON File:
              </label>
              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isUploading}
                className="file-input"
              />
              <small className="form-help">
                Maximum file size: 1MB. Only JSON files are accepted.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="count-input" className="form-label">
                <FaDatabase className="label-icon" />
                Number of Simulations:
              </label>
              <input
                id="count-input"
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                disabled={isUploading}
                className="count-input"
              />
              <small className="form-help">
                Create multiple simulations with the same configuration
                (1-1000).
              </small>
            </div>

            {errors.length > 0 && (
              <div className="error-messages">
                <div className="error-header">
                  <FaExclamationTriangle className="error-icon" />
                  <h4 className="error-title">Validation Errors:</h4>
                </div>
                <ul className="error-list">
                  {errors.map((error, index) => (
                    <li key={index} className="error-item">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {file && errors.length === 0 && (
              <div className="file-preview">
                <div className="preview-header">
                  <FaCheckCircle className="preview-icon" />
                  <h4 className="preview-title">File Ready for Import</h4>
                </div>
                <div className="preview-details">
                  <div className="preview-item">
                    <span className="preview-label">File:</span>
                    <span className="preview-value">{file.name}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Size:</span>
                    <span className="preview-value">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Will create:</span>
                    <span className="preview-value">
                      {count} simulation{count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="modal-button cancel-button"
            >
              <FaTimes className="button-icon" />
              <span className="button-text">Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="modal-button upload-button"
            >
              {isUploading ? (
                <>
                  <FaSpinner className="button-icon spinner" />
                  <span className="button-text">Processing...</span>
                </>
              ) : (
                <>
                  <FaUpload className="button-icon" />
                  <span className="button-text">Import Simulations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImportSimulationModal;
