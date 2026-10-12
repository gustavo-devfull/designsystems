import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  argTypes: { activationMode: { control: "inline-radio", options: ["automatic", "manual"] } },
  args: { defaultValue: "overview" },
  render: (args) => (
    <Tabs {...args} className="w-[28rem] max-w-full">
      <TabsList aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        A summary of the project, its owners and recent changes.
      </TabsContent>
      <TabsContent value="activity">Everything that happened lately, newest first.</TabsContent>
      <TabsContent value="billing">Plans and invoices.</TabsContent>
      <TabsContent value="settings">Name, visibility and danger zone.</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{ArrowRight}"); // skips the disabled tab
    await expect(canvas.getByRole("tab", { name: "Settings" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel")).toHaveFocus();
  },
};

/** Arrows move focus only; Enter or Space selects. Good when panels are expensive to render. */
export const ManualActivation: Story = { args: { activationMode: "manual" } };

export const SecondSelected: Story = { args: { defaultValue: "activity" } };

export const LongLabels: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="a" className="w-80">
      <TabsList aria-label="Long labels" className="overflow-x-auto">
        <TabsTrigger value="a">A tab with a long label</TabsTrigger>
        <TabsTrigger value="b">Another very long tab label</TabsTrigger>
        <TabsTrigger value="c">Yet another one</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Scroll the tab list horizontally when it does not fit.</TabsContent>
      <TabsContent value="b">B</TabsContent>
      <TabsContent value="c">C</TabsContent>
    </Tabs>
  ),
};

export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="rounded-surface bg-background-primary p-lg">
        <Story />
      </div>
    ),
  ],
};
