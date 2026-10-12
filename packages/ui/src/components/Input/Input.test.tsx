import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Input } from "./Input";

describe("Input", () => {
  describe("labelling", () => {
    it("associates the label with the input", () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
    });

    it("keeps the accessible name when the label is visually hidden", () => {
      render(<Input label="Search" hideLabel />);
      expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument();
      expect(screen.getByText("Search")).toHaveClass("sr-only");
    });

    it("generates unique ids for several fields and honours an explicit id", () => {
      render(
        <>
          <Input label="First" />
          <Input label="Second" />
          <Input label="Third" id="custom" />
        </>,
      );
      const [a, b, c] = screen.getAllByRole("textbox");
      expect(a?.id).not.toBe(b?.id);
      expect(c).toHaveAttribute("id", "custom");
      expect(screen.getByLabelText("Third")).toBe(c);
    });
  });

  describe("helper text and errors", () => {
    it("describes the input with the helper text", () => {
      render(<Input label="Email" helperText="We never share it" />);
      expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("We never share it");
      expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
    });

    it("marks the input invalid and replaces the helper with the error", () => {
      render(<Input label="Email" helperText="We never share it" error="Enter a valid email" />);
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription("Enter a valid email");
      expect(screen.queryByText("We never share it")).not.toBeInTheDocument();
    });

    it("appends consumer aria-describedby ids instead of replacing the wiring", () => {
      render(
        <>
          <p id="extra">Extra hint</p>
          <Input label="Email" helperText="Helper" aria-describedby="extra" />
        </>,
      );
      expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Extra hint Helper");
    });

    it("keeps a live region mounted so a late error is announced", () => {
      const { container, rerender } = render(<Input label="Email" />);
      const region = container.querySelector("[aria-live='polite']");
      expect(region).toBeInTheDocument();
      rerender(<Input label="Email" error="Required" />);
      expect(container.querySelector("[aria-live='polite']")).toBe(region);
      expect(region).toHaveTextContent("Required");
    });
  });

  describe("required and disabled", () => {
    it("sets the native required attribute and a decorative asterisk", () => {
      render(<Input label="Name" required />);
      expect(screen.getByLabelText(/Name/)).toBeRequired();
      expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    });

    it("is skipped by Tab and ignores typing when disabled", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Input label="Off" disabled />
          <Input label="On" />
        </>,
      );
      await user.tab();
      expect(screen.getByLabelText("On")).toHaveFocus();
      await user.type(screen.getByLabelText("Off"), "x");
      expect(screen.getByLabelText("Off")).toHaveValue("");
    });
  });

  describe("interaction", () => {
    it("accepts typing and reports changes", async () => {
      const onChange = vi.fn();
      render(<Input label="Name" onChange={onChange} />);
      await userEvent.type(screen.getByLabelText("Name"), "Ada");
      expect(screen.getByLabelText("Name")).toHaveValue("Ada");
      expect(onChange).toHaveBeenCalledTimes(3);
    });

    it("focuses the input when the label is clicked", async () => {
      render(<Input label="Name" />);
      await userEvent.click(screen.getByText("Name"));
      expect(screen.getByLabelText("Name")).toHaveFocus();
    });

    it("forwards ref, type and native attributes to the input", () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} label="Pass" type="password" maxLength={8} placeholder="••••" />);
      expect(ref.current).toBe(screen.getByLabelText("Pass"));
      expect(ref.current).toHaveAttribute("type", "password");
      expect(ref.current).toHaveAttribute("maxlength", "8");
    });

    it("applies className to the wrapper and inputClassName to the input", () => {
      const { container } = render(<Input label="X" className="w-80" inputClassName="font-mono" />);
      expect(container.firstElementChild).toHaveClass("w-80");
      expect(screen.getByLabelText("X")).toHaveClass("font-mono");
    });
  });

  describe("a11y", () => {
    it("a11y: default, helper, error, required, disabled and hidden-label states have no violations", async () => {
      const { container } = render(
        <>
          <Input label="Default" />
          <Input label="Helper" helperText="Hint" />
          <Input label="Error" error="Bad" />
          <Input label="Required" required />
          <Input label="Disabled" disabled />
          <Input label="Hidden" hideLabel />
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
