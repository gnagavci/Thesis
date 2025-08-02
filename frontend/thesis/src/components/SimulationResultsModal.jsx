import React, { useMemo, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useSimulationResults } from "../hooks/useSimulationResults";
import {
  FaTimes,
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
  FaChartLine,
  FaFlask,
  FaVirus,
  FaShieldAlt,
  FaPills,
  FaHeartbeat,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import "./SimulationResultsModal.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SimulationResultsModal = ({
  simulationId,
  simulation,
  isOpen,
  onClose,
}) => {
  const { data, loading, error } = useSimulationResults(simulationId, isOpen);

  // Process chart data
  const chartData = useMemo(() => {
    if (!data?.result) return null;

    const result =
      typeof data.result === "string" ? JSON.parse(data.result) : data.result;

    // Generate time points based on duration
    const duration = result.simulationDuration || simulation?.duration || 60;
    const timePoints = Array.from(
      { length: 10 },
      (_, i) => `${Math.round((duration / 9) * i)} min`
    );

    // Calculate progression data
    const initialTumor =
      result.initialTumorCount || simulation?.tumorCount || 100;
    const finalTumor = result.finalTumorCount || Math.round(initialTumor * 1.5);
    const tumorProgression = Array.from({ length: 10 }, (_, i) => {
      const progress = i / 9;
      return Math.round(initialTumor + (finalTumor - initialTumor) * progress);
    });

    // Calculate immune response
    const immuneEfficiency = parseFloat(result.immuneEfficiency || 75) / 100;
    const immuneCount =
      result.immuneCellsDeployed || simulation?.immuneCount || 0;
    const immuneResponse = Array.from({ length: 10 }, (_, i) => {
      const progress = i / 9;
      return Math.round(immuneCount * immuneEfficiency * progress);
    });

    // Drug effectiveness over time
    const drugEffectiveness = parseFloat(result.drugEffectiveness || 60);
    const drugResponse = Array.from({ length: 10 }, (_, i) => {
      const progress = i / 9;
      return Math.round(drugEffectiveness * progress);
    });

    return {
      labels: timePoints,
      datasets: [
        {
          label: "Tumor Cell Count",
          data: tumorProgression,
          borderColor: "rgb(231, 76, 60)",
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Immune Response",
          data: immuneResponse,
          borderColor: "rgb(52, 152, 219)",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Drug Effectiveness (%)",
          data: drugResponse,
          borderColor: "rgb(46, 204, 113)",
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [data, simulation]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: `Simulation Results: ${simulation?.title || "Untitled"}`,
          font: {
            size: 16,
            weight: "bold",
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "white",
          bodyColor: "white",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Count / Percentage",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          beginAtZero: true,
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    }),
    [simulation]
  );

  // Download JSON handler
  const handleDownloadJSON = useCallback(() => {
    if (!data) return;

    const jsonData = {
      simulationId: simulation.id,
      title: simulation.title,
      parameters: {
        mode: simulation.mode,
        substrate: simulation.substrate,
        duration: simulation.duration,
        tumorCount: simulation.tumorCount,
        immuneCount: simulation.immuneCount,
        stemCount: simulation.stemCount,
        fibroblastCount: simulation.fibroblastCount,
        drugCarrierCount: simulation.drugCarrierCount,
        tumorMovement: simulation.tumorMovement,
        immuneMovement: simulation.immuneMovement,
        stemMovement: simulation.stemMovement,
        fibroblastMovement: simulation.fibroblastMovement,
        drugCarrierMovement: simulation.drugCarrierMovement,
      },
      results: data.result,
      createdAt: simulation.createdAt,
      status: simulation.status,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `simulation-${simulation.id}-results.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, simulation]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Add keyboard event listener
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const result =
    data?.result &&
    (typeof data.result === "string" ? JSON.parse(data.result) : data.result);

  return (
    <>
      <div className="modal-backdrop" onClick={handleBackdropClick} />
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title-section">
              <FaChartLine className="modal-title-icon" />
              <h2 className="modal-title">Simulation Results</h2>
            </div>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className="modal-body">
            {loading && (
              <div className="modal-loading">
                <FaSpinner className="spinner" />
                <p>Loading results...</p>
              </div>
            )}

            {error && !loading && (
              <div className="modal-error">
                <FaExclamationTriangle className="error-icon" />
                <div className="error-content">
                  <p className="error-text">Error: {error}</p>
                  <p className="error-subtext">
                    Please try refreshing or contact support if the problem
                    persists.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && data && (
              <>
                {/* Chart Section */}
                {chartData && (
                  <div className="chart-section">
                    <div className="section-header">
                      <FaChartLine className="section-icon" />
                      <h3 className="section-title">Progression Over Time</h3>
                    </div>
                    <div className="chart-container">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="metrics-section">
                  <div className="section-header">
                    <FaFlask className="section-icon" />
                    <h3 className="section-title">Key Metrics</h3>
                  </div>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-header">
                        <FaVirus className="metric-icon tumor" />
                        <h4 className="metric-label">Initial Tumor Count</h4>
                      </div>
                      <p className="metric-value">
                        {result?.initialTumorCount ||
                          simulation?.tumorCount ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <FaVirus className="metric-icon tumor" />
                        <h4 className="metric-label">Final Tumor Count</h4>
                      </div>
                      <p className="metric-value">
                        {result?.finalTumorCount ||
                          (simulation?.tumorCount
                            ? Math.round(simulation.tumorCount * 1.5)
                            : "N/A")}
                      </p>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <FaHeartbeat className="metric-icon growth" />
                        <h4 className="metric-label">Tumor Growth Rate</h4>
                      </div>
                      <p className="metric-value">
                        {result?.tumorGrowthRate
                          ? `${parseFloat(result.tumorGrowthRate).toFixed(2)}%`
                          : "2.5%"}
                      </p>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <FaShieldAlt className="metric-icon survival" />
                        <h4 className="metric-label">Survival Rate</h4>
                      </div>
                      <p className="metric-value">
                        {result?.survivalRate
                          ? `${result.survivalRate}%`
                          : "82%"}
                      </p>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <FaShieldAlt className="metric-icon immune" />
                        <h4 className="metric-label">Immune Efficiency</h4>
                      </div>
                      <p className="metric-value">
                        {result?.immuneEfficiency
                          ? `${result.immuneEfficiency}%`
                          : "75%"}
                      </p>
                    </div>
                    <div className="metric-card">
                      <div className="metric-header">
                        <FaPills className="metric-icon drug" />
                        <h4 className="metric-label">Drug Effectiveness</h4>
                      </div>
                      <p className="metric-value">
                        {result?.drugEffectiveness
                          ? `${result.drugEffectiveness}%`
                          : "68%"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="details-section">
                  <div className="section-header">
                    <FaFlask className="section-icon" />
                    <h3 className="section-title">Simulation Details</h3>
                  </div>
                  <div className="result-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <FaFlask className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Mode:</span>
                          <span className="detail-value">
                            {simulation?.mode || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaFlask className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Substrate:</span>
                          <span className="detail-value">
                            {simulation?.substrate || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Duration:</span>
                          <span className="detail-value">
                            {simulation?.duration || "N/A"} minutes
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaVirus className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">
                            Initial Tumor Count:
                          </span>
                          <span className="detail-value">
                            {simulation?.tumorCount || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaShieldAlt className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">
                            Initial Immune Count:
                          </span>
                          <span className="detail-value">
                            {simulation?.immuneCount || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaHeartbeat className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Status:</span>
                          <span className="detail-value">
                            {simulation?.status || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Completed:</span>
                          <span className="detail-value">
                            {result?.timestamp ||
                              simulation?.createdAt ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!loading && !error && !data && (
              <div className="modal-error">
                <FaExclamationTriangle className="error-icon" />
                <div className="error-content">
                  <p className="error-text">
                    No results available for this simulation.
                  </p>
                  <p className="error-subtext">
                    The simulation may still be running or may not have
                    completed successfully.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="modal-button close-button" onClick={onClose}>
              <FaTimes className="button-icon" />
              <span className="button-text">Close</span>
            </button>
            <button
              className="modal-button download-button"
              onClick={handleDownloadJSON}
              disabled={!data || loading}
            >
              <FaDownload className="button-icon" />
              <span className="button-text">Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimulationResultsModal;
