import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("is hidden from assistive tech when decorative", () => {
    const { container } = render(<Spinner />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("exposes a status with an accessible name when labelled", () => {
    render(<Spinner label="Loading results" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading results");
  });

  it("forwards ref and merges className onto the graphic", () => {
    const ref = { current: null as HTMLSpanElement | null };
    const { container } = render(<Spinner ref={ref} className="text-action-primary" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(container.querySelector("svg")).toHaveClass("text-action-primary");
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(<Spinner label="Loading" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
