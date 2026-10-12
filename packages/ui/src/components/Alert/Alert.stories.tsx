import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Alert } from "./Alert";

const variants = ["info", "success", "warning", "error"] as const;

const meta = {
  title: "Components/Alert",
  component: Alert,
  args: {
    title: "Heads up",
    children: "Your trial ends in 3 days. Add a payment method to keep your projects.",
  },
  argTypes: { variant: { control: "select", options: variants } },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-md">
      <Alert variant="info" title="Information">
        A new version is available.
      </Alert>
      <Alert variant="success" title="Saved">
        Your changes were saved.
      </Alert>
      <Alert variant="warning" title="Careful">
        This action cannot be undone.
      </Alert>
      <Alert variant="error" title="Payment failed">
        Check your card details and try again.
      </Alert>
    </div>
  ),
};

export const TitleOnly: Story = { args: { children: undefined, title: "Profile updated" } };
export const DescriptionOnly: Story = { args: { title: undefined } };
export const NoIcon: Story = { args: { icon: false } };

function DismissibleExample() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert
      variant="success"
      title="Invitation sent"
      onDismiss={() => {
        setOpen(false);
      }}
    >
      We emailed ada@lovelace.dev.
    </Alert>
  ) : (
    <p role="status" className="text-sm text-text-secondary">
      Alert dismissed.
    </p>
  );
}

export const Dismissible: Story = {
  parameters: { controls: { disable: true } },
  render: () => <DismissibleExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(canvas.getByText("Alert dismissed.")).toBeInTheDocument();
  },
};

export const LongContent: Story = {
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    variant: "warning",
    title: "A rather long alert title that needs to wrap onto more than one line",
    children:
      "Description text that goes on for a while to demonstrate wrapping inside a narrow container, next to the icon and the dismiss button.",
    onDismiss: () => undefined,
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      data-theme="dark"
      className="flex flex-col gap-md rounded-surface bg-background-primary p-lg"
    >
      {variants.map((v) => (
        <Alert key={v} variant={v} title={v} onDismiss={() => undefined}>
          Description of the {v} alert.
        </Alert>
      ))}
    </div>
  ),
};
