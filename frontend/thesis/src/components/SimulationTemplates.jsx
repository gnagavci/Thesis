import React from "react";
import "./SimulationTemplates.css";

// Define all available simulation fields that the worker actually uses
export const AVAILABLE_FIELDS = {
  title: {
    type: "text",
    label: "Title",
    default: "Untitled",
    required: false,
    category: "basic",
  },
  mode: {
    type: "select",
    label: "Mode",
    options: ["2D", "3D"],
    default: "2D",
    required: false,
    category: "basic",
  },
  substrate: {
    type: "select",
    label: "Substrate",
    options: ["Oxygen", "Glucose", "Nutrients"],
    default: "Oxygen",
    required: false,
    category: "basic",
  },
  duration: {
    type: "number",
    label: "Duration (minutes)",
    default: 5,
    min: 1,
    max: 1440,
    required: false,
    category: "basic",
  },
  decayRate: {
    type: "number",
    label: "Decay Rate",
    default: 0.1,
    min: 0,
    max: 1,
    step: 0.01,
    required: false,
    category: "rates",
  },
  divisionRate: {
    type: "number",
    label: "Division Rate",
    default: 0.1,
    min: 0,
    max: 1,
    step: 0.01,
    required: false,
    category: "rates",
  },
  x: {
    type: "number",
    label: "X Dimension",
    default: 1,
    min: 1,
    max: 1000,
    required: false,
    category: "dimensions",
  },
  y: {
    type: "number",
    label: "Y Dimension",
    default: 1,
    min: 1,
    max: 1000,
    required: false,
    category: "dimensions",
  },
  z: {
    type: "number",
    label: "Z Dimension",
    default: null,
    min: 1,
    max: 1000,
    required: false,
    category: "dimensions",
    dependsOn: { field: "mode", value: "3D" },
  },
  tumorCount: {
    type: "number",
    label: "Tumor Count",
    default: 100,
    min: 1,
    max: 10000,
    required: true,
    category: "cells",
  },
  tumorMovement: {
    type: "select",
    label: "Tumor Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
  },
  immuneCount: {
    type: "number",
    label: "Immune Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
  },
  immuneMovement: {
    type: "select",
    label: "Immune Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
  },
  stemCount: {
    type: "number",
    label: "Stem Cell Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
  },
  stemMovement: {
    type: "select",
    label: "Stem Cell Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
  },
  fibroblastCount: {
    type: "number",
    label: "Fibroblast Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
  },
  fibroblastMovement: {
    type: "select",
    label: "Fibroblast Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
  },
  drugCarrierCount: {
    type: "number",
    label: "Drug Carrier Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
  },
  drugCarrierMovement: {
    type: "select",
    label: "Drug Carrier Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
  },
};

export const SIMULATION_TEMPLATES = {
  basic: {
    name: "Basic",
    description: "Simple simulation with essential parameters",
    fields: {
      title: { ...AVAILABLE_FIELDS.title, default: "Basic Simulation" },
      mode: { ...AVAILABLE_FIELDS.mode },
      duration: { ...AVAILABLE_FIELDS.duration },
      tumorCount: { ...AVAILABLE_FIELDS.tumorCount },
      x: { ...AVAILABLE_FIELDS.x, default: 50 },
      y: { ...AVAILABLE_FIELDS.y, default: 50 },
    },
  },
  advanced: {
    name: "Advanced",
    description: "Comprehensive simulation with cell interactions",
    fields: {
      title: { ...AVAILABLE_FIELDS.title, default: "Advanced Simulation" },
      mode: { ...AVAILABLE_FIELDS.mode, default: "3D" },
      substrate: { ...AVAILABLE_FIELDS.substrate, default: "Glucose" },
      duration: { ...AVAILABLE_FIELDS.duration, default: 30 },
      decayRate: { ...AVAILABLE_FIELDS.decayRate, default: 0.15 },
      divisionRate: { ...AVAILABLE_FIELDS.divisionRate, default: 0.25 },
      x: { ...AVAILABLE_FIELDS.x, default: 100 },
      y: { ...AVAILABLE_FIELDS.y, default: 100 },
      z: { ...AVAILABLE_FIELDS.z, default: 50 },
      tumorCount: { ...AVAILABLE_FIELDS.tumorCount, default: 500 },
      tumorMovement: { ...AVAILABLE_FIELDS.tumorMovement, default: "Random" },
      immuneCount: { ...AVAILABLE_FIELDS.immuneCount, default: 200 },
      immuneMovement: {
        ...AVAILABLE_FIELDS.immuneMovement,
        default: "Directed",
      },
    },
  },
  performance: {
    name: "Performance",
    description: "High-performance simulation for benchmarking",
    fields: {
      title: { ...AVAILABLE_FIELDS.title, default: "Performance Test" },
      mode: { ...AVAILABLE_FIELDS.mode, default: "3D" },
      substrate: { ...AVAILABLE_FIELDS.substrate, default: "Nutrients" },
      duration: { ...AVAILABLE_FIELDS.duration, default: 60 },
      decayRate: { ...AVAILABLE_FIELDS.decayRate, default: 0.2 },
      divisionRate: { ...AVAILABLE_FIELDS.divisionRate, default: 0.3 },
      x: { ...AVAILABLE_FIELDS.x, default: 200 },
      y: { ...AVAILABLE_FIELDS.y, default: 200 },
      z: { ...AVAILABLE_FIELDS.z, default: 100 },
      tumorCount: { ...AVAILABLE_FIELDS.tumorCount, default: 2000 },
      tumorMovement: { ...AVAILABLE_FIELDS.tumorMovement, default: "Flow" },
      immuneCount: { ...AVAILABLE_FIELDS.immuneCount, default: 500 },
      immuneMovement: { ...AVAILABLE_FIELDS.immuneMovement, default: "Flow" },
      stemCount: { ...AVAILABLE_FIELDS.stemCount, default: 100 },
      stemMovement: { ...AVAILABLE_FIELDS.stemMovement, default: "Collective" },
      drugCarrierCount: { ...AVAILABLE_FIELDS.drugCarrierCount, default: 50 },
      drugCarrierMovement: {
        ...AVAILABLE_FIELDS.drugCarrierMovement,
        default: "Directed",
      },
    },
  },
};

const SimulationTemplates = ({
  selectedTemplate,
  onTemplateChange,
  selectedFields,
  onFieldToggle,
}) => {
  const fieldCategories = {
    basic: "Basic Information",
    dimensions: "Dimensions",
    rates: "Growth Rates",
    cells: "Cell Types",
  };

  return (
    <div className="simulation-templates">
      <div className="template-selector">
        <label htmlFor="template">Select Template</label>
        <select
          id="template"
          value={selectedTemplate}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="template-dropdown"
        >
          <option value="basic">Basic - Essential Parameters</option>
          <option value="advanced">Advanced - Cell Interactions</option>
          <option value="performance">Performance - Benchmarking</option>
          <option value="custom">Custom - Choose Your Fields</option>
        </select>
      </div>

      {selectedTemplate !== "custom" &&
        SIMULATION_TEMPLATES[selectedTemplate] && (
          <div className="template-description">
            <p>{SIMULATION_TEMPLATES[selectedTemplate].description}</p>
          </div>
        )}

      {selectedTemplate === "custom" && (
        <div className="custom-field-selector">
          <h4>Select Fields for Your Custom Simulation</h4>
          <p className="custom-description">
            Choose which fields you want to include. Unselected fields will use
            default values.
          </p>

          {Object.entries(fieldCategories).map(
            ([categoryKey, categoryName]) => (
              <div key={categoryKey} className="field-category">
                <h5>{categoryName}</h5>
                <div className="field-checkboxes">
                  {Object.entries(AVAILABLE_FIELDS)
                    .filter(([_, field]) => field.category === categoryKey)
                    .map(([fieldName, field]) => (
                      <label key={fieldName} className="field-checkbox-label">
                        <input
                          type="checkbox"
                          checked={
                            selectedFields.includes(fieldName) || field.required
                          }
                          onChange={() => onFieldToggle(fieldName)}
                          disabled={field.required}
                        />
                        <span className="field-label">
                          {field.label}
                          {field.required && (
                            <span className="required">*</span>
                          )}
                        </span>
                        {field.default !== null &&
                          field.default !== undefined && (
                            <span className="default-value">
                              (default: {field.default})
                            </span>
                          )}
                      </label>
                    ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationTemplates;
