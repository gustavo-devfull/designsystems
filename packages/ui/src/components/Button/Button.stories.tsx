import { ArrowRightIcon, DownloadIcon, PlusIcon } from "@design-system/icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./Button";
import type { ButtonSize, ButtonVariant } from "./Button.types";

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "danger"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

const iconOptions = {
  none: undefined,
  plus: <PlusIcon />,
  arrow: <ArrowRightIcon />,
  download: <DownloadIcon />,
};

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "inline-radio", options: sizes },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    leftIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
    rightIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-md">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-md">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size}>
          Size {size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  args: { leftIcon: <PlusIcon />, children: "New project" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-md">
      <Button {...args} />
      <Button {...args} leftIcon={undefined} rightIcon={<ArrowRightIcon />}>
        Continue
      </Button>
      <Button {...args} leftIcon={<DownloadIcon />} rightIcon={<ArrowRightIcon />}>
        Both sides
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-md">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    for (const button of buttons) {
      await expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** Loading keeps the button's width and height, stays focusable and ignores activation. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-md">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size}>
          Save changes
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const [button] = within(canvasElement).getAllByRole("button");
    if (!button) throw new Error("expected a button");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** Same button idle vs loading, overlaid for comparison: the outlines must coincide. */
export const LoadingKeepsSize: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col items-start gap-md">
      <Button {...args}>Save changes</Button>
      <Button {...args} loading>
        Save changes
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

/** Long labels truncate inside the container; the full text remains the accessible name. */
export const LongContent: Story = {
  args: {
    children: "An extraordinarily long button label that cannot possibly fit in its container",
    rightIcon: <ArrowRightIcon />,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const InForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <form
      className="flex gap-sm"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Button type="submit">Submit</Button>
      <Button type="reset" variant="secondary">
        Reset
      </Button>
    </form>
  ),
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="flex flex-wrap items-center gap-md rounded-surface bg-background-primary p-lg"
    >
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
      <Button {...args} loading>
        loading
      </Button>
      <Button {...args} disabled>
        disabled
      </Button>
    </div>
  ),
};

/** Every variant × size × state, for visual regression and a11y sweeps. */
export const Matrix: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: (args) => (
    <div className="flex flex-col gap-lg">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-md">
          <code className="w-24 text-sm">{variant}</code>
          {sizes.map((size) => (
            <Button key={size} {...args} variant={variant} size={size}>
              {size}
            </Button>
          ))}
          <Button {...args} variant={variant} disabled>
            disabled
          </Button>
          <Button {...args} variant={variant} loading>
            loading
          </Button>
        </div>
      ))}
    </div>
  ),
};
