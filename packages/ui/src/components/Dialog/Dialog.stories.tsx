import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button";
import { Input } from "../Input";
import { ThemeProvider } from "../../theme";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: DialogContent,
  subcomponents: { Dialog, DialogTrigger, DialogClose, DialogFooter },
  parameters: { layout: "centered" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  args: {
    title: "Delete project",
    description: "This permanently removes the project and all of its data.",
    size: "md",
  },
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">Delete project</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Delete project" });
    await expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex gap-md">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="outline">Size {size}</Button>
          </DialogTrigger>
          <DialogContent
            {...args}
            size={size}
            title={`Size ${size}`}
            description="Width follows size tokens."
          >
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
};

export const WithoutDescription: Story = {
  args: { title: "Session expired", description: undefined },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <p>Please sign in again to continue.</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Sign in</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

function FormDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const error = name.trim().length === 0 ? "Enter a name." : undefined;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New project</Button>
      </DialogTrigger>
      <DialogContent title="New project" description="Give it a name you can recognise later.">
        <form
          className="flex flex-col gap-md"
          onSubmit={(event) => {
            event.preventDefault();
            if (!error) setOpen(false);
          }}
        >
          <Input
            label="Project name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
            error={error}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Form inside a dialog: initial focus lands on the first field; Esc and Cancel dismiss. */
export const WithForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormDialog />,
};

/** Long content scrolls inside the dialog; the page behind is locked and inert. */
export const LongContent: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Terms of service</Button>
      </DialogTrigger>
      <DialogContent {...args} title="Terms of service" description="Please read carefully.">
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i} className="text-sm">
            {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris.
          </p>
        ))}
        <DialogFooter>
          <DialogClose asChild>
            <Button>I agree</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** `ThemeProvider scope="element"` hosts overlays inside the themed subtree, so the dialog is dark too. */
export const DarkTheme: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ThemeProvider scope="element" defaultTheme="dark" className="rounded-surface p-lg">
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent {...args}>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="danger">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  ),
};
