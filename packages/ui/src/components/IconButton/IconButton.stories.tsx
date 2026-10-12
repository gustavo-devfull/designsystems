import { CloseIcon, DownloadIcon, PlusIcon, SearchIcon, TrashIcon } from "@design-system/icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { IconButton } from "./IconButton";

const variants = ["primary", "secondary", "outline", "ghost", "danger"] as const;
const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  args: { "aria-label": "Add item", children: <PlusIcon />, onClick: fn() },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "inline-radio", options: sizes },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Add item" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-md">
      {variants.map((variant) => (
        <IconButton key={variant} {...args} variant={variant} aria-label={`${variant} action`} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-md">
      {sizes.map((size) => (
        <IconButton
          key={size}
          {...args}
          size={size}
          variant="outline"
          aria-label={`Size ${size}`}
        />
      ))}
    </div>
  ),
};

export const Icons: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-md">
      <IconButton {...args} aria-label="Search">
        <SearchIcon />
      </IconButton>
      <IconButton {...args} aria-label="Download">
        <DownloadIcon />
      </IconButton>
      <IconButton {...args} aria-label="Close">
        <CloseIcon />
      </IconButton>
      <IconButton {...args} variant="danger" aria-label="Delete">
        <TrashIcon />
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true, variant: "outline" } };
export const Loading: Story = {
  args: { loading: true, variant: "primary", "aria-label": "Saving" },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="flex items-center gap-md rounded-surface bg-background-primary p-lg"
    >
      {variants.map((variant) => (
        <IconButton key={variant} {...args} variant={variant} aria-label={`${variant} action`} />
      ))}
      <IconButton {...args} disabled aria-label="disabled" />
    </div>
  ),
};
