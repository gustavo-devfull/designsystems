import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

const plans = (props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) => (
  <RadioGroup legend="Plan" {...props}>
    <Radio value="free" label="Free" />
    <Radio value="pro" label="Pro" helperText="Billed monthly" />
    <Radio value="team" label="Team" />
  </RadioGroup>
);

describe("RadioGroup + Radio", () => {
  it("exposes a named radiogroup with its radios sharing one name", () => {
    render(plans());
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(new Set(radios.map((r) => r.getAttribute("name"))).size).toBe(1);
  });

  it("selects one at a time by clicking options or their labels", async () => {
    const user = userEvent.setup();
    render(plans());
    await user.click(screen.getByLabelText("Pro"));
    expect(screen.getByLabelText("Pro")).toBeChecked();
    await user.click(screen.getByText("Team"));
    expect(screen.getByLabelText("Team")).toBeChecked();
    expect(screen.getByLabelText("Pro")).not.toBeChecked();
  });

  it("enters the group with Tab once and moves with the arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <>
        {plans({ defaultValue: "free" })}
        <button>after</button>
      </>,
    );
    await user.tab();
    expect(screen.getByLabelText("Free")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByLabelText("Pro")).toHaveFocus();
    expect(screen.getByLabelText("Pro")).toBeChecked();
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("works controlled and reports value changes", async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("free");
      return plans({
        value,
        onValueChange: (v) => {
          setValue(v);
          onValueChange(v);
        },
      });
    }
    render(<Controlled />);
    expect(screen.getByLabelText("Free")).toBeChecked();
    await userEvent.click(screen.getByLabelText("Team"));
    expect(onValueChange).toHaveBeenCalledWith("team");
    expect(screen.getByLabelText("Team")).toBeChecked();
  });

  it("describes the group with helper text, flags errors and required", () => {
    const { rerender } = render(plans({ helperText: "You can change it later" }));
    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("You can change it later");
    rerender(plans({ error: "Choose a plan", required: true }));
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAccessibleDescription("Choose a plan");
  });

  it("describes an individual radio with its own helper text", () => {
    render(plans());
    expect(screen.getByLabelText("Pro")).toHaveAccessibleDescription("Billed monthly");
  });

  it("disables every option when the group is disabled", async () => {
    const user = userEvent.setup();
    render(plans({ disabled: true }));
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    await user.click(screen.getByText("Free"));
    expect(screen.getByLabelText("Free")).not.toBeChecked();
  });

  it("disables a single option", () => {
    render(
      <RadioGroup legend="Plan">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" disabled />
      </RadioGroup>,
    );
    expect(screen.getByLabelText("A")).toBeEnabled();
    expect(screen.getByLabelText("B")).toBeDisabled();
  });

  it("fails loudly when a Radio is used outside a group", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Radio value="x" label="X" />)).toThrow(/RadioGroup/);
    spy.mockRestore();
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(
      <>
        {plans({ defaultValue: "pro" })}
        {plans({ error: "Choose", required: true, hideLegend: true })}
        {plans({ disabled: true, orientation: "horizontal" })}
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
