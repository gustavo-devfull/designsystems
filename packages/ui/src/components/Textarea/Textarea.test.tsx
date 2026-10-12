import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("is a labelled multi-line textbox with 4 rows by default", () => {
    render(<Textarea label="Message" />);
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveAttribute("rows", "4");
  });

  it("wires helper text and errors like every other field", () => {
    const { rerender } = render(<Textarea label="Bio" helperText="Max 200 characters" />);
    expect(screen.getByLabelText("Bio")).toHaveAccessibleDescription("Max 200 characters");
    rerender(<Textarea label="Bio" helperText="Max 200 characters" error="Too long" />);
    expect(screen.getByLabelText("Bio")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Bio")).toHaveAccessibleDescription("Too long");
  });

  it("supports required, disabled, typing with line breaks and ref", async () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} label="Notes" required />);
    expect(screen.getByLabelText(/Notes/)).toBeRequired();
    await userEvent.type(screen.getByLabelText(/Notes/), "a{Enter}b");
    expect(ref.current).toHaveValue("a\nb");
  });

  it("does not accept input when disabled", async () => {
    render(<Textarea label="Off" disabled />);
    await userEvent.type(screen.getByLabelText("Off"), "x");
    expect(screen.getByLabelText("Off")).toHaveValue("");
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(
      <>
        <Textarea label="One" helperText="Hint" />
        <Textarea label="Two" error="Bad" required />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
