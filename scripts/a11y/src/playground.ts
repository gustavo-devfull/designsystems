import type { Browser, Page } from "playwright";
import { runAxe } from "./axe.ts";
import type { RunResult } from "./report.ts";

interface Scenario {
  name: string;
  run: (page: Page) => Promise<void>;
}

const scenarios: Scenario[] = [
  { name: "Overview", run: () => Promise.resolve() },
  {
    name: "Team tab",
    run: async (page) => {
      await page.getByRole("tab", { name: "Team" }).click();
    },
  },
  {
    name: "Settings tab",
    run: async (page) => {
      await page.getByRole("tab", { name: "Settings" }).click();
    },
  },
  {
    name: "Settings with validation errors",
    run: async (page) => {
      await page.getByRole("tab", { name: "Settings" }).click();
      await page.getByLabel(/Project name/).fill("");
      await page.getByRole("button", { name: "Save changes" }).click();
      await page.getByText("Give your project a name.").waitFor();
    },
  },
  {
    name: "Invite dialog open",
    run: async (page) => {
      await page.getByRole("tab", { name: "Team" }).click();
      await page.getByRole("button", { name: "Invite member" }).click();
      await page.getByRole("dialog", { name: "Invite member" }).waitFor();
    },
  },
  {
    name: "Invite dialog with errors",
    run: async (page) => {
      await page.getByRole("tab", { name: "Team" }).click();
      await page.getByRole("button", { name: "Invite member" }).click();
      await page.getByRole("button", { name: "Send invitation" }).click();
      await page.getByText("Enter an email like ada@company.com.").waitFor();
    },
  },
  {
    name: "Delete dialog open",
    run: async (page) => {
      await page.getByRole("button", { name: "Delete project" }).click();
      await page.getByRole("dialog", { name: "Delete project" }).waitFor();
    },
  },
  {
    name: "Tooltip open",
    run: async (page) => {
      await page.getByRole("button", { name: "Notifications" }).focus();
      await page.getByRole("tooltip").first().waitFor({ state: "attached" });
    },
  },
];

/** The real application, in real light/dark rendering (system colour scheme), page-level rules on. */
export async function sweepPlayground(opts: {
  browser: Browser;
  baseUrl: string;
  themes: string[];
}): Promise<RunResult[]> {
  const results: RunResult[] = [];
  for (const theme of opts.themes) {
    for (const scenario of scenarios) {
      const context = await opts.browser.newContext({
        viewport: { width: 1280, height: 900 },
        colorScheme: theme === "dark" ? "dark" : "light",
      });
      const page = await context.newPage();
      const pageErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message.slice(0, 200)));
      let error: string | undefined;
      let violations: RunResult["violations"] = [];
      try {
        await page.goto(opts.baseUrl, { waitUntil: "load" });
        await page.getByRole("heading", { level: 1 }).waitFor();
        await scenario.run(page);
        violations = await runAxe(page);
      } catch (e) {
        error = `Scenario failed: ${(e as Error).message.split("\n")[0] ?? "unknown"}`;
      }
      if (!error && pageErrors.length > 0) error = `Uncaught: ${pageErrors[0]}`;
      results.push({
        target: "playground",
        name: scenario.name,
        theme,
        violations,
        ...(error ? { error } : {}),
      });
      await context.close();
    }
  }
  return results;
}
