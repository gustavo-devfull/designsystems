import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function mockSystemTheme(initial: "light" | "dark") {
  let dark = initial === "dark";
  const listeners = new Set<() => void>();
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return dark;
    },
    addEventListener: (_: string, l: () => void) => listeners.add(l),
    removeEventListener: (_: string, l: () => void) => listeners.delete(l),
  })) as unknown as typeof window.matchMedia;
  return (next: "light" | "dark") => {
    dark = next === "dark";
    act(() => listeners.forEach((l) => l()));
  };
}

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <output data-testid="state">{`${theme}:${resolvedTheme}`}</output>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("system")}>system</button>
    </div>
  );
}

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  window.localStorage.clear();
});

describe("ThemeProvider", () => {
  it("follows the operating system by default and reacts to changes", () => {
    const setSystem = mockSystemTheme("dark");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    setSystem("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(screen.getByTestId("state")).toHaveTextContent("system:light");
  });

  it("applies an explicit choice and persists it", async () => {
    mockSystemTheme("light");
    const user = userEvent.setup();
    const { unmount } = render(
      <ThemeProvider storageKey="ds-theme">
        <Probe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "dark" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem("ds-theme")).toBe("dark");
    unmount();
    expect(document.documentElement).not.toHaveAttribute("data-theme");

    render(
      <ThemeProvider storageKey="ds-theme">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("dark:dark");
  });

  it("scopes the theme to a wrapper element without touching <html>", () => {
    mockSystemTheme("light");
    const { container } = render(
      <ThemeProvider scope="element" defaultTheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("fails loudly when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
