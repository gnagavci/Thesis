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
    const duration = result.simulationDuration || 60;
    const timePoints = Array.from(
      { length: 10 },
      (_, i) => `${Math.round((duration / 9) * i)} min`
    );

    // Calculate progression data
    const initialTumor = result.initialTumorCount || 100;
    const finalTumor = result.finalTumorCount || 150;
    const tumorProgression = Array.from({ length: 10 }, (_, i) => {
      const progress = i / 9;
      return Math.round(initialTumor + (finalTumor - initialTumor) * progress);
    });

    // Calculate immune response
    const immuneEfficiency = parseFloat(result.immuneEfficiency || 0) / 100;
    const immuneCount = result.immuneCellsDeployed || 0;
    const immuneResponse = Array.from({ length: 10 }, (_, i) => {
      const progress = i / 9;
      return Math.round(immuneCount * immuneEfficiency * progress);
    });

    // Drug effectiveness over time
    const drugEffectiveness = parseFloat(result.drugEffectiveness || 0);
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
  }, [data]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `Simulation Results: ${simulation?.title || "Untitled"}`,
          font: {
            size: 16,
            weight: "bold",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Count / Percentage",
          },
        },
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
      },
      results: data.result,
      createdAt: simulation.createdAt,
      status: simulation.status,
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

  if (!isOpen) return null;

  const result =
    data?.result &&
    (typeof data.result === "string" ? JSON.parse(data.result) : data.result);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Simulation Results</h2>
            <button className="modal-close" onClick={onClose}>
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
              </div>
            )}

            {!loading && !error && chartData && (
              <>
                {/* Chart Section */}
                <div className="chart-container">
                  <Line data={chartData} options={chartOptions} />
                </div>

                {/* Key Metrics */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Initial Tumor Count</h4>
                    <p className="metric-value">
                      {result?.initialTumorCount || "N/A"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Final Tumor Count</h4>
                    <p className="metric-value">
                      {result?.finalTumorCount || "N/A"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Tumor Growth Rate</h4>
                    <p className="metric-value">
                      {result?.tumorGrowthRate
                        ? `${parseFloat(result.tumorGrowthRate).toFixed(2)}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Survival Rate</h4>
                    <p className="metric-value">
                      {result?.survivalRate ? `${result.survivalRate}%` : "N/A"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Immune Efficiency</h4>
                    <p className="metric-value">
                      {result?.immuneEfficiency
                        ? `${result.immuneEfficiency}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h4>Drug Effectiveness</h4>
                    <p className="metric-value">
                      {result?.drugEffectiveness
                        ? `${result.drugEffectiveness}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="result-details">
                  <h4>Simulation Details</h4>
                  <ul>
                    <li>
                      <strong>Mode:</strong> {simulation.mode}
                    </li>
                    <li>
                      <strong>Substrate:</strong> {simulation.substrate}
                    </li>
                    <li>
                      <strong>Duration:</strong> {simulation.duration} minutes
                    </li>
                    <li>
                      <strong>Completed:</strong> {result?.timestamp || "N/A"}
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              className="download-button"
              onClick={handleDownloadJSON}
              disabled={!data || loading}
            >
              📥 Download JSON
            </button>
            <button className="close-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimulationResultsModal;
