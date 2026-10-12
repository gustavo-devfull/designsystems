import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("is a horizontal separator by default", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("separator").tagName).toBe("HR");
  });

  it("is a vertical separator with the matching orientation", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("can be decorative, removing it from the accessibility tree", () => {
    const { rerender } = render(<Divider decorative />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    rerender(<Divider decorative orientation="vertical" />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("merges className and forwards ref", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Divider ref={ref} className="bg-border-strong" />);
    expect(ref.current).toHaveClass("bg-border-strong");
    expect(ref.current).not.toHaveClass("bg-border-default");
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(
      <div>
        <p>A</p>
        <Divider />
        <p>B</p>
        <div style={{ display: "flex" }}>
          <span>C</span>
          <Divider orientation="vertical" />
          <span>D</span>
        </div>
        <Divider decorative />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
