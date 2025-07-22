import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Mock the dependencies - must be hoisted
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/utils/api", () => ({
  apiCall: vi.fn(),
}));

vi.mock("@/hooks/usePolling", () => ({
  usePolling: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock SimulationResultsModal
vi.mock("@/components/SimulationResultsModal", () => ({
  default: ({ isOpen, onClose, simulation }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="results-modal">
        <h2>Simulation Results</h2>
        <p>Results for: {simulation?.title}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

// Import after mocking
import SimulationDashboard from "@/components/SimulationDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/utils/api";
import { usePolling } from "@/hooks/usePolling";
import { useNavigate } from "react-router-dom";

const DashboardWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("SimulationDashboard Component", () => {
  const mockUser = { id: 1, username: "testuser" };
  const mockLogout = vi.fn();
  const mockNavigate = vi.fn();
  const mockRefetch = vi.fn();

  const mockSimulations = [
    {
      id: 1,
      title: "Cancer Cell Growth",
      mode: "3D",
      substrate: "Oxygen",
      duration: 30,
      status: "Done",
      tumorCount: 500,
      immuneCount: 200,
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      title: "Immune Response Model",
      mode: "2D",
      substrate: "Glucose",
      duration: 45,
      status: "Running",
      tumorCount: 300,
      immuneCount: 150,
      createdAt: "2024-01-15T11:00:00Z",
    },
    {
      id: 3,
      title: "Drug Efficacy Study",
      mode: "3D",
      substrate: "Nutrients",
      duration: 60,
      status: "Submitted",
      tumorCount: 1000,
      immuneCount: 500,
      createdAt: "2024-01-15T12:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    useNavigate.mockReturnValue(mockNavigate);

    usePolling.mockReturnValue({
      data: null,
      error: null,
      loading: false,
      refetch: mockRefetch,
    });

    apiCall.mockResolvedValue({
      simulations: mockSimulations,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders dashboard with navigation and controls", async () => {
    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText("My Simulations")).toBeInTheDocument();
    expect(screen.getByText("Simulation Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Create New Simulation")).toBeInTheDocument();
    expect(screen.getByText("Welcome, testuser")).toBeInTheDocument();

    // The text "Live Updates ON" is inside a button with emoji, so let's check for the button content
    expect(screen.getByText("🔄 Live Updates ON")).toBeInTheDocument();
  });

  it("fetches and displays simulation list", async () => {
    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancer Cell Growth")).toBeInTheDocument();
      expect(screen.getByText("Immune Response Model")).toBeInTheDocument();
      expect(screen.getByText("Drug Efficacy Study")).toBeInTheDocument();
    });

    // Check status displays
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    apiCall.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText(/loading simulations/i)).toBeInTheDocument();
  });

  it("enables Check Results button only for completed simulations", async () => {
    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancer Cell Growth")).toBeInTheDocument();
    });

    const checkResultsButtons = screen.getAllByText(/check results/i);

    // All simulations have the button
    expect(checkResultsButtons).toHaveLength(3);

    // Check that only the Done simulation's button is enabled
    const doneSimCard = screen
      .getByText("Cancer Cell Growth")
      .closest(".simulation-card");
    const doneButton = doneSimCard.querySelector("button.results-button");
    expect(doneButton).not.toBeDisabled();

    const runningSimCard = screen
      .getByText("Immune Response Model")
      .closest(".simulation-card");
    const runningButton = runningSimCard.querySelector("button.results-button");
    expect(runningButton).toBeDisabled();
  });

  it("opens results modal when Check Results is clicked", async () => {
    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancer Cell Growth")).toBeInTheDocument();
    });

    const doneSimCard = screen
      .getByText("Cancer Cell Growth")
      .closest(".simulation-card");
    const checkResultsButton = doneSimCard.querySelector(
      "button.results-button"
    );

    fireEvent.click(checkResultsButton);

    await waitFor(() => {
      expect(screen.getByTestId("results-modal")).toBeInTheDocument();
      expect(
        screen.getByText("Results for: Cancer Cell Growth")
      ).toBeInTheDocument();
    });
  });

  it("handles simulation deletion with confirmation", async () => {
    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Cancer Cell Growth")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete simulation "Cancer Cell Growth"?'
    );

    await waitFor(() => {
      expect(apiCall).toHaveBeenCalledWith("/simulations/1", {
        method: "DELETE",
      });
    });
  });

  it("toggles update strategy between polling and manual", async () => {
    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    const toggleButton = screen.getByText("🔄 Live Updates ON");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText("⏸️ Live Updates OFF")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    apiCall.mockRejectedValueOnce(new Error("Network error"));

    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });
  });

  it("shows empty state when no simulations exist", async () => {
    apiCall.mockResolvedValueOnce({ simulations: [] });

    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText("You haven't created any simulations yet.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Create your first simulation")
      ).toBeInTheDocument();
    });
  });

  it("redirects to login if user is not authenticated", () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(
      <DashboardWrapper>
        <SimulationDashboard />
      </DashboardWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
