import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Button } from "./Button";
import type { ButtonVariant } from "./Button.types";

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "danger"];

describe("Button", () => {
  describe("rendering", () => {
    it("renders a native button that does not submit by default", () => {
      render(<Button>Save</Button>);
      expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
    });

    it("defaults to primary / md and exposes them for styling and testing hooks", () => {
      render(<Button>Save</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", "primary");
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
    });

    it.each(variants)("supports the %s variant with a distinct style", (variant) => {
      render(<Button variant={variant}>Action</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", variant);
      expect(button.className).toContain(`bg-button-background-${variant}`);
    });

    it("applies size and fullWidth", () => {
      render(
        <Button size="lg" fullWidth>
          Wide
        </Button>,
      );
      expect(screen.getByRole("button")).toHaveClass("h-control-lg", "w-full");
    });

    it("merges className, letting the consumer override utilities", () => {
      render(<Button className="px-xl">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-xl");
      expect(button).not.toHaveClass("px-md");
    });

    it("forwards ref and native attributes", () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(
        <Button ref={ref} data-testid="x" form="f" name="n">
          Ref
        </Button>,
      );
      expect(ref.current).toBe(screen.getByTestId("x"));
      expect(ref.current).toHaveAttribute("name", "n");
    });

    it("renders icons as decorative content next to the label", () => {
      render(
        <Button leftIcon={<svg data-testid="left" />} rightIcon={<svg data-testid="right" />}>
          Next
        </Button>,
      );
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
      expect(screen.getByTestId("left").parentElement).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByTestId("right").parentElement).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("interaction", () => {
    it("calls onClick on click", async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Go</Button>);
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("activates with Enter and Space", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={onClick}>Go</Button>);
      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("submits its form when type=submit", async () => {
      const onSubmit = vi.fn((e: React.SyntheticEvent) => {
        e.preventDefault();
      });
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit">Send</Button>
        </form>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled", () => {
    it("is natively disabled, ignores clicks and is skipped by Tab", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <>
          <Button disabled onClick={onClick}>
            Off
          </Button>
          <Button>After</Button>
        </>,
      );
      expect(screen.getByRole("button", { name: "Off" })).toBeDisabled();
      await user.click(screen.getByRole("button", { name: "Off" }));
      expect(onClick).not.toHaveBeenCalled();
      await user.tab();
      expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    });
  });

  describe("loading", () => {
    it("announces busy state without removing the accessible name", () => {
      render(<Button loading>Save changes</Button>);
      const button = screen.getByRole("button", { name: "Save changes" });
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toBeEnabled(); // stays focusable
    });

    it("keeps the label mounted (hidden) so dimensions stay stable", () => {
      const { rerender } = render(<Button>Save changes</Button>);
      expect(screen.getByText("Save changes").parentElement).not.toHaveClass("opacity-0");
      rerender(<Button loading>Save changes</Button>);
      expect(screen.getByText("Save changes").parentElement).toHaveClass("opacity-0");
    });

    it("blocks onClick and form submission", async () => {
      const onClick = vi.fn();
      const onSubmit = vi.fn((e: React.SyntheticEvent) => {
        e.preventDefault();
      });
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit" loading onClick={onClick}>
            Send
          </Button>
        </form>,
      );
      await userEvent.click(screen.getByRole("button"));
      await userEvent.keyboard("{Enter}");
      expect(onClick).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("remains reachable by keyboard", async () => {
      const user = userEvent.setup();
      render(<Button loading>Busy</Button>);
      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
    });

    it("does not claim aria-disabled when natively disabled", () => {
      render(
        <Button loading disabled>
          Both
        </Button>,
      );
      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-disabled");
    });
  });

  describe("a11y", () => {
    it.each(variants)("a11y: %s variant has no axe violations", async (variant) => {
      const { container } = render(<Button variant={variant}>Label</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("a11y: disabled, loading and icon states have no axe violations", async () => {
      const { container } = render(
        <>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button leftIcon={<svg viewBox="0 0 1 1" />}>Icon</Button>
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
