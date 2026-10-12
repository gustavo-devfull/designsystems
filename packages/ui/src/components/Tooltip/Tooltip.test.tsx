import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("is not rendered until the trigger is hovered or focused", () => {
    render(
      <Tooltip content="Save your work">
        <Button>Save</Button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows on keyboard focus and describes the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Save your work" delayDuration={0}>
        <Button>Save</Button>
      </Tooltip>,
    );
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Save your work");
    expect(screen.getByRole("button", { name: "Save" })).toHaveAccessibleDescription(
      "Save your work",
    );
  });

  it("shows on hover and hides when the pointer leaves", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Save your work" delayDuration={0}>
        <Button>Save</Button>
      </Tooltip>,
    );
    await user.hover(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    // Radix keeps hoverable content open inside a grace area; leave it by moving elsewhere.
    await user.unhover(screen.getByRole("button", { name: "Save" }));
    await user.pointer({ target: document.body, coords: { clientX: 500, clientY: 500 } });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("is dismissible with Escape without moving focus (WCAG 1.4.13)", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Save your work" delayDuration={0}>
        <Button>Save</Button>
      </Tooltip>,
    );
    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("does not replace the accessible name of an icon-only trigger", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Add a new project" delayDuration={0}>
        <IconButton aria-label="Add">
          <svg viewBox="0 0 1 1" />
        </IconButton>
      </Tooltip>,
    );
    await user.tab();
    await screen.findByRole("tooltip");
    const button = screen.getByRole("button", { name: "Add" });
    expect(button).toHaveAccessibleDescription("Add a new project");
  });

  it("supports controlled open state", () => {
    const { rerender } = render(
      <Tooltip content="Info" open={false}>
        <Button>Trigger</Button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    rerender(
      <Tooltip content="Info" open>
        <Button>Trigger</Button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Info");
  });

  it("a11y: an open tooltip has no axe violations", async () => {
    render(
      <Tooltip content="Save your work" defaultOpen>
        <Button>Save</Button>
      </Tooltip>,
    );
    await screen.findByRole("tooltip");
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
