import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SimulationTemplates from "@/components/SimulationTemplates";

describe("SimulationTemplates Component", () => {
  const mockProps = {
    selectedTemplate: "basic",
    onTemplateChange: vi.fn(),
    selectedFields: ["title", "mode", "duration", "tumorCount", "x", "y"],
    onFieldToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders template selector with all options", () => {
    render(<SimulationTemplates {...mockProps} />);

    const templateSelect = screen.getByLabelText("Select Template");
    expect(templateSelect).toBeInTheDocument();

    // Check all template options are present
    expect(
      screen.getByText("Basic - Essential Parameters")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Advanced - Cell Interactions")
    ).toBeInTheDocument();
    expect(screen.getByText("Performance - Benchmarking")).toBeInTheDocument();
    expect(screen.getByText("Custom - Choose Your Fields")).toBeInTheDocument();
  });

  it("shows template description for non-custom templates", () => {
    render(<SimulationTemplates {...mockProps} />);

    expect(
      screen.getByText("Simple simulation with essential parameters")
    ).toBeInTheDocument();
  });

  it("calls onTemplateChange when selection changes", () => {
    render(<SimulationTemplates {...mockProps} />);

    const templateSelect = screen.getByLabelText("Select Template");
    fireEvent.change(templateSelect, { target: { value: "advanced" } });

    expect(mockProps.onTemplateChange).toHaveBeenCalledWith("advanced");
  });

  it("shows advanced template description when advanced is selected", () => {
    const advancedProps = {
      ...mockProps,
      selectedTemplate: "advanced",
    };

    render(<SimulationTemplates {...advancedProps} />);

    expect(
      screen.getByText("Comprehensive simulation with cell interactions")
    ).toBeInTheDocument();
  });

  it("shows performance template description when performance is selected", () => {
    const performanceProps = {
      ...mockProps,
      selectedTemplate: "performance",
    };

    render(<SimulationTemplates {...performanceProps} />);

    expect(
      screen.getByText("High-performance simulation for benchmarking")
    ).toBeInTheDocument();
  });

  it("shows custom field selector when custom template is selected", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount"], // Only required field
    };

    render(<SimulationTemplates {...customProps} />);

    expect(
      screen.getByText("Select Fields for Your Custom Simulation")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Choose which fields you want to include. Unselected fields will use default values."
      )
    ).toBeInTheDocument();

    // Check field categories are present
    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Growth Rates")).toBeInTheDocument();
    expect(screen.getByText("Cell Types")).toBeInTheDocument();
  });

  it("shows field checkboxes in custom mode", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount", "title"],
    };

    render(<SimulationTemplates {...customProps} />);

    // Check some key fields are present by their labels
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("Duration (minutes)")).toBeInTheDocument();
    expect(screen.getByText("Tumor Count")).toBeInTheDocument();
  });

  it("calls onFieldToggle when field checkbox is clicked", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount"],
    };

    render(<SimulationTemplates {...customProps} />);

    // Find the title checkbox by getting all checkboxes and finding the right one
    const checkboxes = screen.getAllByRole("checkbox");
    const titleCheckbox = checkboxes.find((checkbox) => {
      const label = checkbox.closest("label");
      return label && label.textContent.includes("Title");
    });

    expect(titleCheckbox).toBeDefined();
    fireEvent.click(titleCheckbox);

    expect(mockProps.onFieldToggle).toHaveBeenCalledWith("title");
  });

  it("shows required field indicator and disables required field checkboxes", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount"],
    };

    render(<SimulationTemplates {...customProps} />);

    // Find the tumor count checkbox
    const checkboxes = screen.getAllByRole("checkbox");
    const tumorCountCheckbox = checkboxes.find((checkbox) => {
      const label = checkbox.closest("label");
      return label && label.textContent.includes("Tumor Count");
    });

    expect(tumorCountCheckbox).toBeChecked();
    expect(tumorCountCheckbox).toBeDisabled();

    // Should show required indicator
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows default values for fields", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount"],
    };

    render(<SimulationTemplates {...customProps} />);

    // Check that default values are shown
    expect(screen.getByText("(default: 100)")).toBeInTheDocument(); // tumorCount default
    expect(screen.getByText("(default: 2D)")).toBeInTheDocument(); // mode default
    expect(screen.getByText("(default: 5)")).toBeInTheDocument(); // duration default
  });

  it("correctly manages checkbox states based on selectedFields prop", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount", "title", "mode"], // Some fields selected
    };

    render(<SimulationTemplates {...customProps} />);

    const checkboxes = screen.getAllByRole("checkbox");

    const titleCheckbox = checkboxes.find((checkbox) => {
      const label = checkbox.closest("label");
      return (
        label &&
        label.textContent.includes("Title") &&
        !label.textContent.includes("Tumor")
      );
    });

    const modeCheckbox = checkboxes.find((checkbox) => {
      const label = checkbox.closest("label");
      return label && label.textContent.includes("Mode");
    });

    const durationCheckbox = checkboxes.find((checkbox) => {
      const label = checkbox.closest("label");
      return label && label.textContent.includes("Duration");
    });

    expect(titleCheckbox).toBeChecked();
    expect(modeCheckbox).toBeChecked();
    expect(durationCheckbox).not.toBeChecked();
  });

  it("groups fields by category correctly", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount"],
    };

    render(<SimulationTemplates {...customProps} />);

    // Check that categories exist and contain the expected fields
    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Cell Types")).toBeInTheDocument();

    // Check that fields appear under their correct categories by checking text content
    const basicSection = screen.getByText("Basic Information").parentElement;
    const cellsSection = screen.getByText("Cell Types").parentElement;

    // Basic Information should contain title, mode, etc.
    expect(basicSection.textContent).toContain("Title");
    expect(basicSection.textContent).toContain("Mode");

    // Cell Types should contain tumor count, immune count, etc.
    expect(cellsSection.textContent).toContain("Tumor Count");
    expect(cellsSection.textContent).toContain("Immune Count");
  });

  it("does not show custom field selector for predefined templates", () => {
    render(<SimulationTemplates {...mockProps} />);

    // Should not show custom field selection UI
    expect(
      screen.queryByText("Select Fields for Your Custom Simulation")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Basic Information")).not.toBeInTheDocument();
  });

  it("shows movement options for cell types", () => {
    const customProps = {
      ...mockProps,
      selectedTemplate: "custom",
      selectedFields: ["tumorCount", "tumorMovement"],
    };

    render(<SimulationTemplates {...customProps} />);

    expect(screen.getByText("Tumor Movement")).toBeInTheDocument();
  });
});
