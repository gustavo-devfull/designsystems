import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  args: { label: "Email", placeholder: "you@company.com" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    type: {
      control: "select",
      options: ["text", "email", "password", "search", "number", "url", "tel"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText("Email");
    await userEvent.type(input, "ada@lovelace.dev");
    await expect(input).toHaveValue("ada@lovelace.dev");
  },
};

export const WithHelperText: Story = { args: { helperText: "We will never share your email." } };

export const Required: Story = { args: { required: true, helperText: "Required field" } };

export const Error: Story = {
  args: { defaultValue: "ada@", error: "Enter a valid email address." },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText("Email");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Enter a valid email address.");
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: "locked@company.com" } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-md">
      <Input {...args} size="sm" label="Small" />
      <Input {...args} size="md" label="Medium" />
      <Input {...args} size="lg" label="Large" />
    </div>
  ),
};

export const HiddenLabel: Story = {
  args: { label: "Search", hideLabel: true, type: "search", placeholder: "Search…" },
};

/** Long labels, helper text and values wrap or scroll inside the container; nothing overflows it. */
export const LongContent: Story = {
  args: {
    label: "A very long label that describes in great detail what is expected in this field",
    helperText:
      "Helper text can also be long: it wraps onto several lines and stays associated with the input through aria-describedby.",
    defaultValue:
      "an-extraordinarily-long-value-that-does-not-fit-in-the-control@example-company.com",
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="flex w-80 flex-col gap-md rounded-surface bg-background-primary p-lg"
    >
      <Input {...args} helperText="Helper text" />
      <Input {...args} label="With error" error="Something is wrong" />
      <Input {...args} label="Disabled" disabled />
    </div>
  ),
};
