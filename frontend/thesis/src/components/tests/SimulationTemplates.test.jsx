import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SimulationTemplates from "../SimulationTemplates";

describe("SimulationTemplates", () => {
  const mockProps = {
    selectedTemplate: "basic",
    onTemplateChange: vi.fn(),
    selectedFields: [],
    onFieldToggle: vi.fn(),
  };

  it("should render template selector", () => {
    render(<SimulationTemplates {...mockProps} />);

    expect(screen.getByLabelText("Select Template")).toBeInTheDocument();
  });

  it("should call onTemplateChange when selection changes", () => {
    render(<SimulationTemplates {...mockProps} />);

    const select = screen.getByLabelText("Select Template");
    fireEvent.change(select, { target: { value: "custom" } });

    expect(mockProps.onTemplateChange).toHaveBeenCalledWith("custom");
  });

  it("should show field checkboxes in custom mode", () => {
    render(<SimulationTemplates {...mockProps} selectedTemplate="custom" />);

    expect(
      screen.getByText("Select Fields for Your Custom Simulation")
    ).toBeInTheDocument();
  });
});
