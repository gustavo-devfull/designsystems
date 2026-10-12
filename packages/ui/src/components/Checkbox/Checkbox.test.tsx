import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("is a labelled checkbox that toggles on click and on Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Accept terms" onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
    await user.tab(); // leaves, then comes back
    await user.tab({ shift: true });
    expect(box).toHaveFocus();
    await user.keyboard(" ");
    expect(box).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("toggles when the label text is clicked", async () => {
    render(<Checkbox label="Newsletter" />);
    await userEvent.click(screen.getByText("Newsletter"));
    expect(screen.getByLabelText("Newsletter")).toBeChecked();
  });

  it("supports controlled and default checked state", () => {
    const { rerender } = render(<Checkbox label="A" defaultChecked />);
    expect(screen.getByLabelText("A")).toBeChecked();
    rerender(<Checkbox label="A" checked={false} onChange={() => undefined} />);
    expect(screen.getByLabelText("A")).not.toBeChecked();
  });

  it("exposes the indeterminate (mixed) state and clears it on click", async () => {
    render(<Checkbox label="Select all" indeterminate />);
    const box = screen.getByLabelText<HTMLInputElement>("Select all");
    expect(box.indeterminate).toBe(true);
    expect(box).toBePartiallyChecked();
    await userEvent.click(box);
    expect(box.indeterminate).toBe(false);
  });

  it("describes with helper text and reflects errors", () => {
    const { rerender } = render(<Checkbox label="Terms" helperText="Read them first" />);
    expect(screen.getByLabelText("Terms")).toHaveAccessibleDescription("Read them first");
    rerender(<Checkbox label="Terms" error="You must accept" required />);
    expect(screen.getByLabelText(/Terms/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Terms/)).toBeRequired();
    expect(screen.getByLabelText(/Terms/)).toHaveAccessibleDescription("You must accept");
  });

  it("cannot be toggled or focused when disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Off" disabled />);
    await user.click(screen.getByLabelText("Off"));
    expect(screen.getByLabelText("Off")).not.toBeChecked();
    await user.tab();
    expect(screen.getByLabelText("Off")).not.toHaveFocus();
  });

  it("forwards ref to the input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Checkbox ref={ref} label="Ref" />);
    expect(ref.current).toBe(screen.getByLabelText("Ref"));
  });

  it("a11y: all states have no axe violations", async () => {
    const { container } = render(
      <>
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Mixed" indeterminate />
        <Checkbox label="Helper" helperText="Hint" />
        <Checkbox label="Error" error="Bad" />
        <Checkbox label="Disabled" disabled />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
