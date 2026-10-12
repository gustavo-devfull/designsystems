import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { IconButton } from "./IconButton";

const Icon = () => <svg data-testid="icon" viewBox="0 0 1 1" />;

describe("IconButton", () => {
  it("is a button named by aria-label, with a decorative icon", () => {
    render(
      <IconButton aria-label="Close dialog">
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Close dialog" });
    expect(button).toHaveAttribute("type", "button");
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("requires an accessible name at compile time", () => {
    // @ts-expect-error aria-label is mandatory: an icon alone gives no accessible name
    render(<IconButton>{<Icon />}</IconButton>);
  });

  it("defaults to ghost / md and supports every variant and size", () => {
    const { rerender } = render(
      <IconButton aria-label="x">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
    rerender(
      <IconButton aria-label="x" variant="danger" size="lg">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole("button")).toHaveClass("size-control-lg");
    expect(screen.getByRole("button").className).toContain("bg-button-background-danger");
  });

  it("activates with click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Add" onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("is natively disabled and skipped by Tab", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <IconButton aria-label="Off" disabled onClick={onClick}>
          <Icon />
        </IconButton>
        <button>next</button>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Off" }));
    expect(onClick).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "next" })).toHaveFocus();
  });

  it("loading is busy, ignores activation, stays focusable and keeps its name", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Save" loading onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards ref and merges className", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <IconButton ref={ref} aria-label="x" className="rounded-pill">
        <Icon />
      </IconButton>,
    );
    expect(ref.current).toHaveClass("rounded-pill");
    expect(ref.current).not.toHaveClass("rounded-control");
  });

  it("a11y: variants, loading and disabled have no axe violations", async () => {
    const { container } = render(
      <>
        {(["primary", "secondary", "outline", "ghost", "danger"] as const).map((variant) => (
          <IconButton key={variant} aria-label={variant} variant={variant}>
            <Icon />
          </IconButton>
        ))}
        <IconButton aria-label="loading" loading>
          <Icon />
        </IconButton>
        <IconButton aria-label="disabled" disabled>
          <Icon />
        </IconButton>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
