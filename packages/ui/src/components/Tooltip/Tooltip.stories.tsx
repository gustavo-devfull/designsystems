import { DownloadIcon, PlusIcon } from "@design-system/icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  args: {
    content: "Create a new project",
    side: "top",
    children: <Button variant="outline">Hover or focus me</Button>,
  },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
  },
  decorators: [
    (Story) => (
      <div className="p-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { delayDuration: 0 },
  play: async () => {
    await userEvent.tab();
    const tip = await screen.findByRole("tooltip");
    await expect(tip).toHaveTextContent("Create a new project");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  },
};

/** Icon-only triggers keep their `aria-label`; the tooltip adds a description, it does not name the control. */
export const OnIconButton: Story = {
  args: {
    content: "Add a new project",
    children: (
      <IconButton aria-label="Add" variant="outline">
        <PlusIcon />
      </IconButton>
    ),
  },
};

export const Sides: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-lg p-xl">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} content={`Tooltip on the ${side}`} side={side}>
          <Button variant="outline" size="sm">
            {side}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Open: Story = { args: { defaultOpen: true } };

export const LongContent: Story = {
  args: {
    defaultOpen: true,
    content:
      "A longer explanation that wraps onto several lines instead of stretching across the whole screen.",
    children: (
      <IconButton aria-label="Download" variant="outline">
        <DownloadIcon />
      </IconButton>
    ),
  },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  args: { defaultOpen: true },
  render: (args) => (
    <div data-theme="dark" className="rounded-surface bg-background-primary p-xl pt-2xl">
      <Tooltip {...args} />
    </div>
  ),
};
