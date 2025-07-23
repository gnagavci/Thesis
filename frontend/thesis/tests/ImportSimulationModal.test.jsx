// frontend/thesis/tests/ImportSimulationModal.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImportSimulationModal from "../src/components/ImportSimulationModal";

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => "mock-token"),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("ImportSimulationModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ imported: 1 }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders modal when open", () => {
    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Import Simulation from File")).toBeInTheDocument();
    expect(screen.getByText("Select JSON File:")).toBeInTheDocument();
    expect(screen.getByText("Number of Simulations:")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ImportSimulationModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(
      screen.queryByText("Import Simulation from File")
    ).not.toBeInTheDocument();
  });

  it("handles file selection", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const fileInput = screen.getByLabelText("Select JSON File:");
    const file = new File(
      [JSON.stringify({ title: "Test Simulation", mode: "2D" })],
      "test.json",
      { type: "application/json" }
    );

    await user.upload(fileInput, file);

    expect(fileInput.files[0]).toBe(file);
    expect(fileInput.files).toHaveLength(1);
  });

  it("validates file size", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const fileInput = screen.getByLabelText("Select JSON File:");

    // Create a large file (over 1MB)
    const largeContent = "x".repeat(1024 * 1024 + 1);
    const largeFile = new File([largeContent], "large.json", {
      type: "application/json",
    });

    await user.upload(fileInput, largeFile);

    expect(
      screen.getByText("File size must be less than 1MB")
    ).toBeInTheDocument();
  });

  it("validates file type", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const fileInput = screen.getByLabelText("Select JSON File:");
    const textFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    await user.upload(fileInput, textFile);

    expect(screen.getByText("Please select a JSON file")).toBeInTheDocument();
  });

  it("validates simulation count range", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const countInput = screen.getByLabelText("Number of Simulations:");

    await user.clear(countInput);
    await user.type(countInput, "1001");

    const uploadButton = screen.getByText("Import Simulations");
    await user.click(uploadButton);

    expect(
      screen.getByText("Number of simulations must be between 1 and 1000")
    ).toBeInTheDocument();
  });

  it("handles successful upload", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const validSimulation = {
      title: "Test Simulation",
      mode: "2D",
      substrate: "Oxygen",
      duration: 10,
      decayRate: 0.1,
      divisionRate: 0.05,
      x: 100,
      y: 100,
      tumorCount: 100,
      immuneCount: 50,
      stemCount: 25,
      fibroblastCount: 75,
      drugCarrierCount: 30,
      tumorMovement: "random",
      immuneMovement: "directed",
      stemMovement: "static",
      fibroblastMovement: "random",
      drugCarrierMovement: "directed",
    };

    const fileInput = screen.getByLabelText("Select JSON File:");
    const file = new File(
      [JSON.stringify(validSimulation)],
      "simulation.json",
      { type: "application/json" }
    );

    await user.upload(fileInput, file);

    const uploadButton = screen.getByText("Import Simulations");
    await user.click(uploadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/simulations/import", {
        method: "POST",
        headers: {
          Authorization: "Bearer mock-token",
        },
        body: expect.any(FormData),
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(1);
    });
  });

  it("handles API errors", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          errors: [{ msg: "Invalid simulation data" }],
        }),
    });

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const validSimulation = {
      title: "Test Simulation",
      mode: "2D",
      substrate: "Oxygen",
      duration: 10,
      decayRate: 0.1,
      divisionRate: 0.05,
      x: 100,
      y: 100,
      tumorCount: 100,
      immuneCount: 50,
      stemCount: 25,
      fibroblastCount: 75,
      drugCarrierCount: 30,
      tumorMovement: "random",
      immuneMovement: "directed",
      stemMovement: "static",
      fibroblastMovement: "random",
      drugCarrierMovement: "directed",
    };

    const fileInput = screen.getByLabelText("Select JSON File:");
    const file = new File(
      [JSON.stringify(validSimulation)],
      "simulation.json",
      { type: "application/json" }
    );

    await user.upload(fileInput, file);

    const uploadButton = screen.getByText("Import Simulations");
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid simulation data")).toBeInTheDocument();
    });
  });

  it("closes modal on cancel", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes modal on overlay click", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const overlay = screen.getByRole("dialog").parentElement;
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
