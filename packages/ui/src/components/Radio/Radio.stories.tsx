import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Components/Radio",
  component: RadioGroup,
  subcomponents: { Radio },
  args: {
    legend: "Plan",
    defaultValue: "free",
    children: [
      <Radio key="free" value="free" label="Free" helperText="For personal projects" />,
      <Radio key="pro" value="pro" label="Pro" helperText="For professionals" />,
      <Radio key="team" value="team" label="Team" />,
    ],
  },
  argTypes: { orientation: { control: "inline-radio", options: ["vertical", "horizontal"] } },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByLabelText("Free")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByLabelText("Pro")).toBeChecked();
  },
};

export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const WithHelperText: Story = { args: { helperText: "You can change plans at any time." } };
export const Required: Story = { args: { required: true, defaultValue: undefined } };
export const Error: Story = {
  args: { required: true, defaultValue: undefined, error: "Choose a plan to continue." },
};
export const Disabled: Story = { args: { disabled: true } };

export const LongContent: Story = {
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    legend: "Which of the following plans best matches the way you intend to use the product?",
    children: [
      <Radio
        key="a"
        value="a"
        label="An extraordinarily long option label that wraps onto multiple lines"
      />,
      <Radio key="b" value="b" label="Short" />,
    ],
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div data-theme="dark" className="rounded-surface bg-background-primary p-lg">
      <RadioGroup {...args} />
    </div>
  ),
};
