import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { label: "Accept the terms and conditions" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox");
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(box).not.toBeChecked();
  },
};

export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { indeterminate: true, label: "Select all" } };
export const WithHelperText: Story = {
  args: { helperText: "You can unsubscribe at any time.", label: "Send me updates" },
};
export const Required: Story = { args: { required: true } };
export const Error: Story = { args: { required: true, error: "You must accept to continue." } };
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-md">
      <Checkbox {...args} disabled label="Disabled" />
      <Checkbox {...args} disabled defaultChecked label="Disabled checked" />
    </div>
  ),
};

function SelectAllExample() {
  const items = ["Email", "SMS", "Push"];
  const [selected, setSelected] = useState<string[]>(["Email"]);
  const all = selected.length === items.length;
  return (
    <fieldset className="m-0 flex flex-col gap-sm border-0 p-0">
      <legend className="sr-only">Notification channels</legend>
      <Checkbox
        label="All channels"
        checked={all}
        indeterminate={!all && selected.length > 0}
        onChange={() => {
          setSelected(all ? [] : items);
        }}
      />
      <div className="ms-lg flex flex-col gap-sm">
        {items.map((item) => (
          <Checkbox
            key={item}
            label={item}
            checked={selected.includes(item)}
            onChange={() => {
              setSelected((s) => (s.includes(item) ? s.filter((i) => i !== item) : [...s, item]));
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}

/** A parent checkbox summarising its children via the indeterminate state. */
export const SelectAll: Story = {
  parameters: { controls: { disable: true } },
  render: () => <SelectAllExample />,
};

export const LongContent: Story = {
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  args: {
    label:
      "I have read and agree to the terms of service, the privacy policy and the cookie policy of this product",
    helperText: "Long helper text wraps next to the box without moving the control.",
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="flex flex-col gap-md rounded-surface bg-background-primary p-lg"
    >
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} label="Checked" defaultChecked />
      <Checkbox {...args} label="Indeterminate" indeterminate />
      <Checkbox {...args} label="Disabled" disabled />
    </div>
  ),
};
