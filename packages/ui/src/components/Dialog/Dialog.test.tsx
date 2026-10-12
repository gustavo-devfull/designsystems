import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { Button } from "../Button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "./Dialog";

function Example(props: { description?: string; defaultOpen?: boolean; showClose?: boolean }) {
  return (
    <Dialog defaultOpen={props.defaultOpen}>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent
        title="Delete project"
        description={props.description}
        showClose={props.showClose}
      >
        <p>This action cannot be undone.</p>
        <input aria-label="Confirm name" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("is closed until the trigger is activated", async () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog", { name: "Delete project" })).toBeInTheDocument();
  });

  it("opens from the keyboard with Enter and with Space", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await user.keyboard(" ");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("is named by its title and described by its description", () => {
    render(<Example description="Deleting removes all of its data." defaultOpen />);
    const dialog = screen.getByRole("dialog", { name: "Delete project" });
    expect(dialog).toHaveAccessibleDescription("Deleting removes all of its data.");
  });

  it("has no aria-describedby when there is no description", () => {
    render(<Example defaultOpen />);
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
  });

  it("moves focus into the dialog on open, to the first focusable control of the body", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    });
    expect(screen.getByLabelText("Confirm name")).toHaveFocus();
  });

  it("traps focus: Tab and Shift+Tab cycle inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    const order = [
      screen.getByLabelText("Confirm name"),
      within(dialog).getByRole("button", { name: "Cancel" }),
      within(dialog).getByRole("button", { name: "Delete" }),
      within(dialog).getByRole("button", { name: "Close" }),
    ];
    await waitFor(() => {
      expect(order[0]).toHaveFocus();
    });
    for (const next of [...order.slice(1), order[0]]) {
      await user.tab();
      expect(next).toHaveFocus();
    }
    await user.tab({ shift: true });
    expect(order[3]).toHaveFocus();
  });

  it("closes with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("closes through DialogClose and the ✕ button", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("can hide the ✕ button and customise its label", () => {
    const { rerender } = render(<Example defaultOpen showClose={false} />);
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    rerender(
      <Dialog open>
        <DialogContent title="T" closeLabel="Fechar" />
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
  });

  it("makes the rest of the page inert for assistive technology while open", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.queryByRole("button", { name: "Open" })).not.toBeInTheDocument();
  });

  it("works controlled and reports open changes", async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            Open
          </Button>
          <Dialog
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next);
              setOpen(next);
            }}
          >
            <DialogContent title="Controlled" />
          </Dialog>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("forwards ref and className to the content", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Dialog open>
        <DialogContent ref={ref} title="T" className="bg-background-secondary" />
      </Dialog>,
    );
    expect(ref.current).toHaveClass("bg-background-secondary");
    expect(ref.current).not.toHaveClass("bg-background-elevated");
  });

  it("does not introduce extra landmarks (a <header> inside a dialog would be a second banner)", () => {
    render(
      <>
        <header>Page header</header>
        <Example defaultOpen />
      </>,
    );
    expect(screen.getByRole("dialog").querySelector("header")).toBeNull();
  });

  it("a11y: an open dialog has no axe violations", async () => {
    render(<Example description="Deleting removes all of its data." defaultOpen />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
