import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
  args: { label: "Loading" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-md text-action-primary">
      <Spinner {...args} size="sm" />
      <Spinner {...args} size="md" />
      <Spinner {...args} size="lg" />
    </div>
  ),
};

/** Without `label` the spinner is `aria-hidden` — use it inside controls that already expose `aria-busy`. */
export const Decorative: Story = { args: { label: undefined } };

export const DarkTheme: Story = {
  render: (args) => (
    <div
      data-theme="dark"
      className="rounded-surface bg-background-primary p-lg text-action-primary"
    >
      <Spinner {...args} />
    </div>
  ),
};
