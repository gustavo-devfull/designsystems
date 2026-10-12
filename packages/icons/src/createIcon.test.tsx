import { render, screen } from "@testing-library/react";
import { configureAxe } from "vitest-axe";

const axe = configureAxe();
import * as icons from "./index";
import { CheckIcon, PlusIcon } from "./index";

describe("icons", () => {
  it("is decorative (hidden from assistive tech) by default", () => {
    const { container } = render(<PlusIcon />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("becomes an image with an accessible name when titled", () => {
    render(<CheckIcon title="Saved" />);
    expect(screen.getByRole("img", { name: "Saved" })).toBeInTheDocument();
  });

  it("applies size and forwards props and ref", () => {
    const ref = { current: null as SVGSVGElement | null };
    render(<PlusIcon ref={ref} size={32} className="text-action-primary" />);
    expect(ref.current).toHaveAttribute("width", "32");
    expect(ref.current).toHaveClass("text-action-primary");
  });

  it("contains no stray text: only graphics, so nothing is exposed besides the optional title", () => {
    const iconEntries = Object.entries(icons).filter(([name]) => /^[A-Z]\w*Icon$/.test(name));
    expect(iconEntries.length).toBeGreaterThanOrEqual(11);
    for (const [name, Icon] of iconEntries) {
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector("svg")?.textContent, name).toBe("");
      unmount();
    }
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(<CheckIcon title="Saved" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
