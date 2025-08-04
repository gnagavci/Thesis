import React from "react";
import {
  FaFlask,
  FaCog,
  FaRuler,
  FaHeart,
  FaVirus,
  FaShieldAlt,
  FaSeedling,
  FaPills,
  FaArrowsAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { IoFlask } from "react-icons/io5";
import "./SimulationTemplates.css";

// Define all available simulation fields that the worker actually uses
export const AVAILABLE_FIELDS = {
  title: {
    type: "text",
    label: "Title",
    default: "Untitled",
    required: false,
    category: "basic",
    icon: "FaFlask",
  },
  mode: {
    type: "select",
    label: "Mode",
    options: ["2D", "3D"],
    default: "2D",
    required: false,
    category: "basic",
    icon: "FaCog",
  },
  substrate: {
    type: "select",
    label: "Substrate",
    options: ["Oxygen", "Glucose", "Nutrients"],
    default: "Oxygen",
    required: false,
    category: "basic",
    icon: "FaFlask",
  },
  duration: {
    type: "number",
    label: "Duration (minutes)",
    default: 5,
    min: 1,
    max: 1440,
    required: false,
    category: "basic",
    icon: "FaCog",
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
    icon: "FaHeart",
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
    icon: "FaHeart",
  },
  x: {
    type: "number",
    label: "X Dimension",
    default: 1,
    min: 1,
    max: 1000,
    required: false,
    category: "dimensions",
    icon: "FaRuler",
  },
  y: {
    type: "number",
    label: "Y Dimension",
    default: 1,
    min: 1,
    max: 1000,
    required: false,
    category: "dimensions",
    icon: "FaRuler",
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
    icon: "FaRuler",
  },
  tumorCount: {
    type: "number",
    label: "Tumor Count",
    default: 100,
    min: 1,
    max: 10000,
    required: true,
    category: "cells",
    icon: "FaVirus",
  },
  tumorMovement: {
    type: "select",
    label: "Tumor Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
    icon: "FaArrowsAlt",
  },
  immuneCount: {
    type: "number",
    label: "Immune Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
    icon: "FaShieldAlt",
  },
  immuneMovement: {
    type: "select",
    label: "Immune Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
    icon: "FaArrowsAlt",
  },
  stemCount: {
    type: "number",
    label: "Stem Cell Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
    icon: "FaSeedling",
  },
  stemMovement: {
    type: "select",
    label: "Stem Cell Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
    icon: "FaArrowsAlt",
  },
  fibroblastCount: {
    type: "number",
    label: "Fibroblast Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
    icon: "FaHeart",
  },
  fibroblastMovement: {
    type: "select",
    label: "Fibroblast Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
    icon: "FaArrowsAlt",
  },
  drugCarrierCount: {
    type: "number",
    label: "Drug Carrier Count",
    default: 0,
    min: 0,
    max: 10000,
    required: false,
    category: "cells",
    icon: "FaPills",
  },
  drugCarrierMovement: {
    type: "select",
    label: "Drug Carrier Movement",
    options: ["None", "Random", "Directed", "Collective", "Flow"],
    default: null,
    required: false,
    category: "cells",
    icon: "FaArrowsAlt",
  },
};

export const SIMULATION_TEMPLATES = {
  basic: {
    name: "Basic",
    description: "Simple simulation with essential parameters",
    icon: "FaFlask",
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
    icon: "FaCog",
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
    icon: "FaHeart",
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
    basic: { name: "Basic Information", icon: FaFlask },
    dimensions: { name: "Dimensions", icon: FaRuler },
    rates: { name: "Growth Rates", icon: FaHeart },
    cells: { name: "Cell Types", icon: FaVirus },
  };

  const getTemplateIcon = (templateKey) => {
    const iconMap = {
      FaFlask: <FaFlask />,
      FaCog: <FaCog />,
      FaHeart: <FaHeart />,
    };

    if (templateKey === "custom") {
      return <FaCog />;
    }

    const template = SIMULATION_TEMPLATES[templateKey];
    return iconMap[template?.icon] || <FaFlask />;
  };

  return (
    <div className="simulation-templates">
      <div className="template-selector">
        <div className="section-header">
          <IoFlask className="section-icon" />
          <h3 className="section-title">Template Selection</h3>
        </div>

        <div className="template-options">
          {Object.entries(SIMULATION_TEMPLATES).map(([key, template]) => (
            <label key={key} className="template-option">
              <input
                type="radio"
                name="template"
                value={key}
                checked={selectedTemplate === key}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="template-radio"
              />
              <div className="template-card">
                <div className="template-header">
                  {getTemplateIcon(key)}
                  <span className="template-name">{template.name}</span>
                </div>
                <p className="template-description">{template.description}</p>
              </div>
            </label>
          ))}

          <label className="template-option">
            <input
              type="radio"
              name="template"
              value="custom"
              checked={selectedTemplate === "custom"}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="template-radio"
            />
            <div className="template-card">
              <div className="template-header">
                <FaCog />
                <span className="template-name">Custom</span>
              </div>
              <p className="template-description">Choose your own fields</p>
            </div>
          </label>
        </div>
      </div>

      {selectedTemplate === "custom" && (
        <div className="custom-field-selector">
          <div className="section-header">
            <FaCog className="section-icon" />
            <h4 className="section-title">
              Select Fields for Your Custom Simulation
            </h4>
          </div>
          <p className="custom-description">
            Choose which fields you want to include. Unselected fields will use
            default values.
          </p>

          {Object.entries(fieldCategories).map(
            ([categoryKey, categoryInfo]) => (
              <div key={categoryKey} className="field-category">
                <div className="category-header">
                  <categoryInfo.icon className="category-icon" />
                  <h5 className="category-name">{categoryInfo.name}</h5>
                </div>
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
                          className="field-checkbox"
                        />
                        <div className="field-info">
                          <div className="field-main">
                            <span className="field-label">
                              {field.label}
                              {field.required && (
                                <span className="required">*</span>
                              )}
                            </span>
                            {field.required && (
                              <FaCheckCircle className="required-icon" />
                            )}
                          </div>
                          {field.default !== null &&
                            field.default !== undefined && (
                              <span className="default-value">
                                Default: {field.default}
                              </span>
                            )}
                        </div>
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
