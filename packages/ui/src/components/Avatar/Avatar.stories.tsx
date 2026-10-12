import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const sizes = ["sm", "md", "lg", "xl"] as const;
// Inline SVG: no network dependency, deterministic in visual tests.
const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#2563eb"/><circle cx="32" cy="26" r="12" fill="#bfdbfe"/><path d="M8 64c2-16 14-22 24-22s22 6 24 22Z" fill="#bfdbfe"/></svg>',
  );

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  args: { name: "Ada Lovelace" },
  argTypes: { size: { control: "inline-radio", options: sizes } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const WithImage: Story = { args: { src: photo } };
export const BrokenImage: Story = { args: { src: "/does-not-exist.png" } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-md">
      {sizes.map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** The name is written next to the avatar, so the avatar itself is hidden from screen readers. */
export const Decorative: Story = {
  render: (args) => (
    <div className="flex items-center gap-sm">
      <Avatar {...args} alt="" />
      <span>Ada Lovelace</span>
    </div>
  ),
};

export const LongName: Story = {
  args: { name: "Maria da Conceição Albuquerque de Souza Pereira" },
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      data-theme="dark"
      className="flex items-center gap-md rounded-surface bg-background-primary p-lg"
    >
      <Avatar {...args} />
      <Avatar {...args} src={photo} />
    </div>
  ),
};
