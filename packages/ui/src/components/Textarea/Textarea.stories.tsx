import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: { label: "Message", placeholder: "Tell us more…" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    rows: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHelperText: Story = { args: { helperText: "Maximum 500 characters." } };
export const Required: Story = { args: { required: true } };
export const Error: Story = { args: { error: "Message is required." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "This field is locked." } };
export const Rows: Story = { args: { rows: 8 } };

export const LongContent: Story = {
  args: {
    defaultValue: Array.from(
      { length: 12 },
      (_, i) => `Line ${i + 1}: lorem ipsum dolor sit amet.`,
    ).join("\n"),
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div data-theme="dark" className="w-96 rounded-surface bg-background-primary p-lg">
      <Textarea {...args} helperText="Helper text" />
    </div>
  ),
};
