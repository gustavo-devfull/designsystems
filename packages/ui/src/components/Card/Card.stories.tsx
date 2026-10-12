import { Button } from "../Button";
import { Badge } from "../Badge";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "centered" },
  argTypes: { variant: { control: "inline-radio", options: ["outline", "elevated"] } },
  args: {
    className: "w-80",
    children: (
      <>
        <CardHeader>
          <CardTitle>Pro plan</CardTitle>
          <CardDescription>For growing teams</CardDescription>
        </CardHeader>
        <CardContent>Unlimited projects, priority support and advanced permissions.</CardContent>
        <CardFooter>
          <Button size="sm">Upgrade</Button>
          <Button size="sm" variant="ghost">
            Compare
          </Button>
        </CardFooter>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Elevated: Story = { args: { variant: "elevated" } };

export const ContentOnly: Story = {
  args: { children: <CardContent>A card with only content.</CardContent> },
};

export const WithBadge: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <div className="flex items-center justify-between gap-sm">
            <CardTitle>Invoice #1042</CardTitle>
            <Badge variant="success">Paid</Badge>
          </div>
          <CardDescription>Issued on 12 Oct 2026</CardDescription>
        </CardHeader>
        <CardContent>R$ 1.250,00</CardContent>
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    className: "w-64",
    children: (
      <>
        <CardHeader>
          <CardTitle>A card title long enough to wrap onto several lines</CardTitle>
        </CardHeader>
        <CardContent>
          Content that keeps going and going so that we can verify the card grows with its content
          instead of clipping or overflowing its container.
        </CardContent>
      </>
    ),
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div data-theme="dark" className="flex gap-md rounded-surface bg-background-primary p-lg">
      <Card {...args} />
      <Card {...args} variant="elevated" />
    </div>
  ),
};
