import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its text content in an inline element", () => {
    render(<Badge>Paid</Badge>);
    expect(screen.getByText("Paid").tagName).toBe("SPAN");
  });

  it("defaults to neutral / md", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toHaveAttribute("data-variant", "neutral");
    expect(screen.getByText("New")).toHaveAttribute("data-size", "md");
  });

  it.each(["neutral", "info", "success", "warning", "error"] as const)(
    "supports the %s variant",
    (variant) => {
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toHaveAttribute("data-variant", variant);
    },
  );

  it("merges className and forwards ref and native attributes", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(
      <Badge ref={ref} className="px-lg" data-testid="b" title="Status">
        x
      </Badge>,
    );
    expect(ref.current).toBe(screen.getByTestId("b"));
    expect(ref.current).toHaveClass("px-lg");
    expect(ref.current).toHaveAttribute("title", "Status");
  });

  it("a11y: every variant has no axe violations", async () => {
    const { container } = render(
      <>
        {(["neutral", "info", "success", "warning", "error"] as const).map((v) => (
          <Badge key={v} variant={v}>
            {v}
          </Badge>
        ))}
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
