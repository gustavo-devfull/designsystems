import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Select } from "./Select";

const options = (
  <>
    <option value="br">Brazil</option>
    <option value="pt">Portugal</option>
    <option value="us">United States</option>
  </>
);

describe("Select", () => {
  it("is a labelled combobox/listbox with its options", () => {
    render(<Select label="Country">{options}</Select>);
    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select.querySelectorAll("option")).toHaveLength(3);
  });

  it("selects an option with the mouse and reports it", async () => {
    const onChange = vi.fn();
    render(
      <Select label="Country" onChange={onChange}>
        {options}
      </Select>,
    );
    await userEvent.selectOptions(screen.getByLabelText("Country"), "pt");
    expect(screen.getByLabelText("Country")).toHaveValue("pt");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is reachable with Tab and keeps focus on the native control", async () => {
    // Arrow-key selection is native browser behaviour; jsdom/user-event do not emulate it.
    const user = userEvent.setup();
    render(
      <>
        <Select label="Country">{options}</Select>
        <button>after</button>
      </>,
    );
    await user.tab();
    expect(screen.getByLabelText("Country")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("renders an empty placeholder option that is selected by default", () => {
    render(
      <Select label="Country" placeholder="Choose a country">
        {options}
      </Select>,
    );
    expect(screen.getByLabelText("Country")).toHaveValue("");
    expect(screen.getByRole("option", { name: "Choose a country" })).toBeInTheDocument();
  });

  it("makes required meaningful with a placeholder (empty value is invalid)", () => {
    render(
      <Select label="Country" placeholder="Choose" required>
        {options}
      </Select>,
    );
    const select = screen.getByLabelText<HTMLSelectElement>(/Country/);
    expect(select).toBeRequired();
    expect(select.validity.valueMissing).toBe(true);
  });

  it("supports helper text, error, disabled and controlled value", () => {
    const { rerender } = render(
      <Select label="Country" helperText="Where you live" value="us" onChange={() => undefined}>
        {options}
      </Select>,
    );
    expect(screen.getByLabelText("Country")).toHaveValue("us");
    expect(screen.getByLabelText("Country")).toHaveAccessibleDescription("Where you live");
    rerender(
      <Select label="Country" error="Pick one" disabled value="us" onChange={() => undefined}>
        {options}
      </Select>,
    );
    expect(screen.getByLabelText("Country")).toBeDisabled();
    expect(screen.getByLabelText("Country")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLSelectElement | null };
    render(
      <Select ref={ref} label="Country">
        {options}
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(
      <>
        <Select label="One" placeholder="Choose">
          {options}
        </Select>
        <Select label="Two" error="Bad" required>
          {options}
        </Select>
        <Select label="Three" disabled>
          {options}
        </Select>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
