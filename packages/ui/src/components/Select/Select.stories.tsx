import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Select } from "./Select";

const countries = (
  <>
    <option value="br">Brazil</option>
    <option value="pt">Portugal</option>
    <option value="us">United States</option>
    <option value="jp">Japan</option>
  </>
);

const meta = {
  title: "Components/Select",
  component: Select,
  args: { label: "Country", placeholder: "Choose a country", children: countries },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText("Country");
    await userEvent.selectOptions(select, "pt");
    await expect(select).toHaveValue("pt");
  },
};

export const WithHelperText: Story = { args: { helperText: "Used to pick your currency." } };
export const Required: Story = { args: { required: true } };
export const Error: Story = { args: { required: true, error: "Select a country to continue." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "br" } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-md">
      <Select {...args} size="sm" label="Small" />
      <Select {...args} size="md" label="Medium" />
      <Select {...args} size="lg" label="Large" />
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    label: "Which of the following best describes where you are located?",
    children: (
      <>
        <option value="1">
          An extraordinarily long option label that does not fit in the control width
        </option>
        <option value="2">Short</option>
      </>
    ),
    defaultValue: "1",
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div data-theme="dark" className="w-80 rounded-surface bg-background-primary p-lg">
      <Select {...args} helperText="Helper text" />
    </div>
  ),
};
