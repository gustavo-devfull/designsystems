import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const variants = ["neutral", "info", "success", "warning", "error"] as const;

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  args: { children: "Draft" },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-sm">
      <Badge {...args} variant="neutral">
        Draft
      </Badge>
      <Badge {...args} variant="info">
        In review
      </Badge>
      <Badge {...args} variant="success">
        Paid
      </Badge>
      <Badge {...args} variant="warning">
        Overdue soon
      </Badge>
      <Badge {...args} variant="error">
        Failed
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-sm">
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
    </div>
  ),
};

export const LongContent: Story = {
  decorators: [
    (Story) => (
      <div className="w-48">
        <Story />
      </div>
    ),
  ],
  args: { variant: "info", children: "An unusually long status label" },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="flex flex-wrap items-center gap-sm rounded-surface bg-background-primary p-lg"
    >
      {variants.map((variant) => (
        <Badge key={variant} {...args} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};
