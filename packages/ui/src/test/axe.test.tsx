import { render } from "@testing-library/react";
import { axe } from "./axe";

describe("a11y harness", () => {
  it("a11y: actually detects violations (guards against a silently-passing setup)", async () => {
    const { container } = render(<button type="button" />);
    const results = await axe(container);
    expect(results.violations.map((v) => v.id)).toContain("button-name");
  });
});
