import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePolling } from "../usePolling";

describe("usePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should fetch data on mount", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: "test" });

    const { result } = renderHook(() =>
      usePolling(mockFetch, { interval: 5000 })
    );

    expect(result.current.loading).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ data: "test" });
    });
  });

  it("should handle errors", async () => {
    const mockError = new Error("Test error");
    const mockFetch = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      usePolling(mockFetch, { interval: 5000 })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError);
    });
  });
});
