// frontend/thesis/src/components/ImportSimulationModal.jsx - UPDATED VERSION
import { useState, useRef } from "react";
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Simulation from File</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="file-input">Select JSON File:</label>
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={isUploading}
              className="file-input"
            />
            <small className="help-text">
              Maximum file size: 1MB. Only JSON files are accepted.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="count-input">Number of Simulations:</label>
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
            <small className="help-text">
              Create multiple simulations with the same configuration (1-1000).
            </small>
          </div>

          {errors.length > 0 && (
            <div className="error-messages">
              <h4>Validation Errors:</h4>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {file && errors.length === 0 && (
            <div className="file-preview">
              <p>
                <strong>Selected file:</strong> {file.name}
              </p>
              <p>
                <strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB
              </p>
              <p>
                <strong>Will create:</strong> {count} simulation
                {count > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="upload-button"
          >
            {isUploading ? "Processing..." : "Import Simulations"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportSimulationModal;
