import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("has the switch role and starts off", () => {
    render(<Switch label="Notifications" />);
    expect(screen.getByRole("switch", { name: "Notifications" })).not.toBeChecked();
  });

  it("toggles with click and with Space, notifying changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Notifications" onChange={onChange} />);
    const toggle = screen.getByRole("switch");
    await user.click(toggle);
    expect(toggle).toBeChecked();
    await user.keyboard(" ");
    expect(toggle).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("toggles through its label", async () => {
    render(<Switch label="Dark mode" />);
    await userEvent.click(screen.getByText("Dark mode"));
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("supports defaultChecked, helper text and errors", () => {
    const { rerender } = render(<Switch label="Beta" defaultChecked helperText="Early features" />);
    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.getByRole("switch")).toHaveAccessibleDescription("Early features");
    rerender(<Switch label="Beta" error="Cannot be changed" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true");
  });

  it("is inert when disabled", async () => {
    const onChange = vi.fn();
    render(<Switch label="Locked" disabled onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(
      <>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
        <Switch label="Disabled" disabled />
        <Switch label="Error" error="Bad" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
