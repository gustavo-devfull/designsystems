import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";

const meta = {
  title: "Components/Divider",
  component: Divider,
  argTypes: { orientation: { control: "inline-radio", options: ["horizontal", "vertical"] } },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-80">
      <p>Section one</p>
      <Divider {...args} className="my-md" />
      <p>Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-8 items-center gap-md">
      <span>Docs</span>
      <Divider {...args} />
      <span>Blog</span>
      <Divider {...args} />
      <span>Changelog</span>
    </div>
  ),
};

/** Decorative dividers are hidden from assistive technology (a heading already separates the content). */
export const Decorative: Story = {
  args: { decorative: true },
  render: (args) => (
    <div className="w-80">
      <h3 className="text-lg font-semibold">Details</h3>
      <Divider {...args} className="my-sm" />
      <p>Content</p>
    </div>
  ),
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="w-80 rounded-surface bg-background-primary p-lg text-text-primary"
    >
      <p>Above</p>
      <Divider {...args} className="my-md" />
      <p>Below</p>
    </div>
  ),
};
