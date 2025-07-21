import { useState, useEffect, useCallback } from "react";
import { apiCall } from "../utils/api";

export function useSimulationResults(simulationId, isOpen) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async () => {
    if (!simulationId || !isOpen) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(`/simulations/${simulationId}/results`);
      setData(response);
    } catch (err) {
      setError(err.message || "Failed to fetch simulation results");
      console.error("Error fetching simulation results:", err);
    } finally {
      setLoading(false);
    }
  }, [simulationId, isOpen]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return { data, loading, error, refetch: fetchResults };
}
