import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

function Example(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return (
    <Tabs defaultValue="account" {...props}>
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account panel</TabsContent>
      <TabsContent value="password">Password panel</TabsContent>
      <TabsContent value="billing">Billing panel</TabsContent>
      <TabsContent value="team">Team panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("exposes a named tablist, tabs and the active panel", () => {
    render(<Example />);
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account panel");
    expect(screen.queryByText("Password panel")).not.toBeInTheDocument();
  });

  it("links each tab to its panel with aria-controls and aria-labelledby", () => {
    render(<Example />);
    const tab = screen.getByRole("tab", { name: "Account" });
    const panel = screen.getByRole("tabpanel");
    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
    expect(panel).toHaveAccessibleName("Account");
  });

  it("selects a tab on click", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("tab", { name: "Password" }));
    expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Password panel");
  });

  it("enters the tab list at the active tab, not the first one", async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="password" />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("tab", { name: "Password" })).not.toHaveFocus();
  });

  it("moves between tabs with the arrow keys, skipping disabled ones, and wraps", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    await user.keyboard("{ArrowRight}"); // skips disabled "Billing"
    expect(screen.getByRole("tab", { name: "Team" })).toHaveFocus();
    await user.keyboard("{ArrowRight}"); // wraps
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Team" })).toHaveFocus();
  });

  it("jumps with Home and End", async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="password" />);
    await user.tab();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Team" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
  });

  it("automatic activation: arrow keys also select", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Password panel");
  });

  it("manual activation: arrows only move focus; Enter or Space selects", async () => {
    const user = userEvent.setup();
    render(<Example activationMode="manual" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account panel");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Password panel");
  });

  it("Tab from the list goes to the active panel, then onwards", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Example />
        <button>after</button>
      </>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("does not select a disabled tab", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("tab", { name: "Billing" }));
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
  });

  it("works controlled and reports changes", async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("account");
      return (
        <Example
          defaultValue={undefined}
          value={value}
          onValueChange={(v) => {
            onValueChange(v);
            setValue(v);
          }}
        />
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("tab", { name: "Team" }));
    expect(onValueChange).toHaveBeenCalledWith("team");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Team panel");
  });

  it("forwards refs and merges className", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <Tabs defaultValue="a">
        <TabsList className="gap-md">
          <TabsTrigger ref={ref} value="a" className="px-lg">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(ref.current).toHaveClass("px-lg");
    expect(ref.current).not.toHaveClass("px-md");
  });

  it("a11y: has no axe violations", async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
