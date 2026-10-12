import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Switch } from "./Switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  args: { label: "Enable notifications" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch");
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};

export const On: Story = { args: { defaultChecked: true } };
export const WithHelperText: Story = {
  args: { helperText: "Applies immediately to all devices." },
};
export const Error: Story = { args: { error: "This setting is managed by your administrator." } };
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-md">
      <Switch {...args} disabled label="Disabled off" />
      <Switch {...args} disabled defaultChecked label="Disabled on" />
    </div>
  ),
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
    label: "Automatically share anonymous diagnostics and usage statistics with the product team",
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="flex flex-col gap-md rounded-surface bg-background-primary p-lg"
    >
      <Switch {...args} label="Off" />
      <Switch {...args} label="On" defaultChecked />
      <Switch {...args} label="Disabled" disabled />
    </div>
  ),
};
