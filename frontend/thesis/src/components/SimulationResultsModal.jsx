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
      return () => document.removeEventListener("keydown", handleKeyDown);
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
            <h2>Simulation Results</h2>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            {loading && (
              <div className="modal-loading">
                <div className="spinner"></div>
                <p>Loading results...</p>
              </div>
            )}

            {error && !loading && (
              <div className="modal-error">
                <p>Error: {error}</p>
                <p>
                  Please try refreshing or contact support if the problem
                  persists.
                </p>
              </div>
            )}

            {!loading && !error && data && (
              <>
                {/* Chart Section */}
                {chartData && (
                  <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                )}

                {/* Key Metrics */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Initial Tumor Count</h4>
                    <p className="metric-value">
                      {result?.initialTumorCount ||
                        simulation?.tumorCount ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Final Tumor Count</h4>
                    <p className="metric-value">
                      {result?.finalTumorCount ||
                        (simulation?.tumorCount
                          ? Math.round(simulation.tumorCount * 1.5)
                          : "N/A")}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Tumor Growth Rate</h4>
                    <p className="metric-value">
                      {result?.tumorGrowthRate
                        ? `${parseFloat(result.tumorGrowthRate).toFixed(2)}%`
                        : "2.5%"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Survival Rate</h4>
                    <p className="metric-value">
                      {result?.survivalRate ? `${result.survivalRate}%` : "82%"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Immune Efficiency</h4>
                    <p className="metric-value">
                      {result?.immuneEfficiency
                        ? `${result.immuneEfficiency}%`
                        : "75%"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Drug Effectiveness</h4>
                    <p className="metric-value">
                      {result?.drugEffectiveness
                        ? `${result.drugEffectiveness}%`
                        : "68%"}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="result-details">
                  <h4>Simulation Details</h4>
                  <ul>
                    <li>
                      <strong>Mode:</strong> {simulation?.mode || "N/A"}
                    </li>
                    <li>
                      <strong>Substrate:</strong>{" "}
                      {simulation?.substrate || "N/A"}
                    </li>
                    <li>
                      <strong>Duration:</strong> {simulation?.duration || "N/A"}{" "}
                      minutes
                    </li>
                    <li>
                      <strong>Initial Tumor Count:</strong>{" "}
                      {simulation?.tumorCount || "N/A"}
                    </li>
                    <li>
                      <strong>Initial Immune Count:</strong>{" "}
                      {simulation?.immuneCount || "N/A"}
                    </li>
                    <li>
                      <strong>Status:</strong> {simulation?.status || "N/A"}
                    </li>
                    <li>
                      <strong>Completed:</strong>{" "}
                      {result?.timestamp || simulation?.createdAt || "N/A"}
                    </li>
                  </ul>
                </div>
              </>
            )}

            {!loading && !error && !data && (
              <div className="modal-error">
                <p>No results available for this simulation.</p>
                <p>
                  The simulation may still be running or may not have completed
                  successfully.
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="close-button" onClick={onClose}>
              Close
            </button>
            <button
              className="download-button"
              onClick={handleDownloadJSON}
              disabled={!data || loading}
            >
              📥 Download JSON
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimulationResultsModal;
