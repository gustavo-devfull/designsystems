import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { axe } from "./test/axe";

vi.mock("./api", () => ({
  saveSettings: vi.fn((settings: unknown) => Promise.resolve(settings)),
}));

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  window.localStorage.clear();
});

describe("playground app", () => {
  it("has a proper page structure: skip link, landmarks and a single h1", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  });

  it("applies the theme chosen with the switch and persists it", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("switch", { name: "Dark mode" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem("sette-theme")).toBe("dark");
  });

  it("dismisses the welcome alert", async () => {
    render(<App />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });

  it("switches tabs with the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Overview" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Team" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: /Members/ })).toBeInTheDocument();
  });

  describe("team: invite dialog", () => {
    async function openInvite(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("tab", { name: "Team" }));
      await user.click(screen.getByRole("button", { name: "Invite member" }));
      return screen.getByRole("dialog", { name: "Invite member" });
    }

    it("validates, focusing the first invalid field", async () => {
      const user = userEvent.setup();
      render(<App />);
      const dialog = await openInvite(user);
      await user.click(within(dialog).getByRole("button", { name: "Send invitation" }));
      const email = within(dialog).getByLabelText(/Email/);
      expect(email).toHaveAttribute("aria-invalid", "true");
      expect(email).toHaveAccessibleDescription("Enter an email like ada@company.com.");
      expect(email).toHaveFocus();
    });

    it("adds the member, closes, announces it and returns focus to the trigger", async () => {
      const user = userEvent.setup();
      render(<App />);
      const dialog = await openInvite(user);
      await user.type(within(dialog).getByLabelText(/Email/), "margaret@sette.dev");
      await user.selectOptions(within(dialog).getByLabelText(/Role/), "Admin");
      await user.click(within(dialog).getByRole("button", { name: "Send invitation" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      expect(screen.getByText("margaret@sette.dev")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Members (4)" })).toBeInTheDocument();
      expect(screen.getByText("Invitation sent to margaret@sette.dev.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Invite member" })).toHaveFocus();
    });

    it("cancels with Escape without adding anyone", async () => {
      const user = userEvent.setup();
      render(<App />);
      await openInvite(user);
      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      expect(screen.getByRole("heading", { name: "Members (3)" })).toBeInTheDocument();
    });
  });

  describe("settings form", () => {
    async function openSettings(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("tab", { name: "Settings" }));
    }

    it("shows every error and focuses the first invalid control", async () => {
      const user = userEvent.setup();
      render(<App />);
      await openSettings(user);
      await user.clear(screen.getByLabelText(/Project name/));
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      expect(screen.getByLabelText(/Project name/)).toHaveAccessibleDescription(
        "Give your project a name.",
      );
      expect(screen.getByLabelText(/Project name/)).toHaveFocus();
      expect(screen.getByRole("radiogroup", { name: /Visibility/ })).toHaveAccessibleDescription(
        "Choose who can see this project.",
      );
    });

    it("saves with a busy button, then confirms and updates the page title", async () => {
      const user = userEvent.setup();
      render(<App />);
      await openSettings(user);
      const name = screen.getByLabelText(/Project name/);
      await user.clear(name);
      await user.type(name, "Atlas");
      await user.click(screen.getByRole("radio", { name: /Team/ }));
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      expect(await screen.findByText("Settings saved")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1, name: "Atlas" })).toBeInTheDocument();
    });
  });

  describe("danger zone", () => {
    it("only enables Delete once the project name is typed, then confirms", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByRole("button", { name: "Delete project" }));
      const dialog = screen.getByRole("dialog", { name: "Delete project" });
      const remove = within(dialog).getByRole("button", { name: "Delete" });
      expect(remove).toBeDisabled();
      await user.type(within(dialog).getByLabelText(/Type/), "Sette Console");
      expect(remove).toBeEnabled();
      await user.click(remove);
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      expect(screen.getByText("Project deleted")).toBeInTheDocument();
    });
  });

  describe("a11y", () => {
    it("a11y: overview tab has no axe violations", async () => {
      const { container } = render(<App />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("a11y: team tab, with the invite dialog open, has no axe violations", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByRole("tab", { name: "Team" }));
      await user.click(screen.getByRole("button", { name: "Invite member" }));
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it("a11y: settings tab with validation errors has no axe violations", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByRole("tab", { name: "Settings" }));
      await user.clear(screen.getByLabelText(/Project name/));
      await user.click(screen.getByRole("button", { name: "Save changes" }));
      expect(await axe(document.body)).toHaveNoViolations();
    });
  });
});
