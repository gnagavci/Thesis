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

// Mock File.prototype.text method
const mockFileText = vi.fn();
Object.defineProperty(File.prototype, "text", {
  value: mockFileText,
  writable: true,
});

describe("ImportSimulationModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful import validation response
    fetch.mockImplementation((url) => {
      if (url.includes("/api/simulations/import")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              imported: 1,
              simulationData: {
                title: "Test Simulation",
                mode: "2D",
                substrate: "Oxygen",
                duration: 10,
                tumorCount: 100,
              },
            }),
        });
      }

      if (url.includes("/api/simulations/create-batch")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              created: 1,
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Mock file.text() to return JSON string
    mockFileText.mockResolvedValue(
      JSON.stringify({
        title: "Test Simulation",
        mode: "2D",
        substrate: "Oxygen",
        duration: 10,
        tumorCount: 100,
      })
    );
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

  it("validates simulation count range", async () => {
    const user = userEvent.setup();

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // First upload a valid file
    const fileInput = screen.getByLabelText("Select JSON File:");
    const validFile = new File(
      [
        JSON.stringify({
          title: "Test",
          mode: "2D",
          substrate: "Oxygen",
          duration: 10,
          tumorCount: 100,
        }),
      ],
      "test.json",
      { type: "application/json" }
    );
    await user.upload(fileInput, validFile);

    // Then test invalid count
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
      tumorCount: 100,
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

    // Wait for both API calls
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
      expect(fetch).toHaveBeenCalledWith("/api/simulations/create-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
        body: expect.stringContaining("Test Simulation"),
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(1);
    });
  });

  it("handles import validation errors", async () => {
    const user = userEvent.setup();

    // Mock import endpoint to return validation error
    fetch.mockImplementation((url) => {
      if (url.includes("/api/simulations/import")) {
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              errors: [{ msg: "Invalid simulation data" }],
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
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
      tumorCount: 100,
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

  it("handles create-batch errors", async () => {
    const user = userEvent.setup();

    // Mock import success but create-batch failure
    fetch.mockImplementation((url) => {
      if (url.includes("/api/simulations/import")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              simulationData: { title: "Test" },
            }),
        });
      }

      if (url.includes("/api/simulations/create-batch")) {
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: "Failed to create simulations",
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const fileInput = screen.getByLabelText("Select JSON File:");
    const file = new File(
      [
        JSON.stringify({
          title: "Test",
          mode: "2D",
          substrate: "Oxygen",
          duration: 10,
          tumorCount: 100,
        }),
      ],
      "simulation.json",
      { type: "application/json" }
    );

    await user.upload(fileInput, file);

    const uploadButton = screen.getByText("Import Simulations");
    await user.click(uploadButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to create simulations")
      ).toBeInTheDocument();
    });
  });

  it("handles invalid JSON content", async () => {
    const user = userEvent.setup();

    // Mock file.text() to return invalid JSON
    mockFileText.mockResolvedValue("{ invalid json");

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const fileInput = screen.getByLabelText("Select JSON File:");
    const file = new File(["{ invalid json"], "invalid.json", {
      type: "application/json",
    });

    await user.upload(fileInput, file);

    const uploadButton = screen.getByText("Import Simulations");
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid JSON format")).toBeInTheDocument();
    });
  });

  it("handles missing required fields", async () => {
    const user = userEvent.setup();

    // Mock file.text() to return JSON missing required fields
    mockFileText.mockResolvedValue(
      JSON.stringify({
        title: "Incomplete",
        mode: "2D",
        // Missing substrate, duration, tumorCount
      })
    );

    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const fileInput = screen.getByLabelText("Select JSON File:");
    const file = new File(
      [JSON.stringify({ title: "Incomplete", mode: "2D" })],
      "incomplete.json",
      { type: "application/json" }
    );

    await user.upload(fileInput, file);

    const uploadButton = screen.getByText("Import Simulations");
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Missing required fields/)).toBeInTheDocument();
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

    // Click the modal overlay (the outer div)
    const overlay = screen
      .getByText("Import Simulation from File")
      .closest(".modal-overlay");
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("disables upload button when no file selected", () => {
    render(
      <ImportSimulationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const uploadButton = screen.getByText("Import Simulations");
    expect(uploadButton).toBeDisabled();
  });

  it("enables upload button when valid file is selected", async () => {
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
      [
        JSON.stringify({
          title: "Test",
          mode: "2D",
          substrate: "Oxygen",
          duration: 10,
          tumorCount: 100,
        }),
      ],
      "test.json",
      { type: "application/json" }
    );

    await user.upload(fileInput, file);

    const uploadButton = screen.getByText("Import Simulations");
    expect(uploadButton).not.toBeDisabled();
  });

  it("shows file preview when valid file is selected", async () => {
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
      [JSON.stringify({ title: "Test", mode: "2D" })],
      "test.json",
      { type: "application/json" }
    );

    await user.upload(fileInput, file);

    expect(screen.getByText("Selected file:")).toBeInTheDocument();
    expect(screen.getByText("test.json")).toBeInTheDocument();
    expect(screen.getByText(/Will create:/)).toBeInTheDocument();
  });
});
