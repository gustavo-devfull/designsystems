import type { Browser, Page } from "playwright";
import { COMPONENT_RULES_OFF, runAxe } from "./axe.ts";
import { mapPool } from "./pool.ts";
import type { RunResult } from "./report.ts";

interface IndexEntry {
  id: string;
  type: string;
  title: string;
  name: string;
}

interface PreviewWindow {
  __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } };
}

const RENDER_TIMEOUT = 20_000;

/**
 * Waits until Storybook has finished rendering the story *and* its play function (phase
 * "finished" in Storybook 9; older versions say "completed"), so interaction
 * tests run and portalled UI (dialogs, tooltips) that a play function opens is present for axe.
 */
async function waitForStory(page: Page): Promise<string | undefined> {
  try {
    await page.waitForFunction(
      () => {
        const phase = (window as unknown as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender
          ?.phase;
        return (
          phase === "finished" ||
          phase === "completed" ||
          phase === "errored" ||
          phase === "aborted"
        );
      },
      undefined,
      { timeout: RENDER_TIMEOUT },
    );
  } catch {
    return "Timed out waiting for the story (and its play function) to finish rendering.";
  }
  const failed = await page.evaluate(() => {
    const phase = (window as unknown as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase;
    const finished = phase === "finished" || phase === "completed";
    // The error template (.sb-errordisplay) is always in the DOM; only trust it when it is shown.
    const shown = document.body.classList.contains("sb-show-errordisplay");
    if (finished && !shown) return undefined;
    const title = document.querySelector("#error-message")?.textContent ?? "";
    const stack = document.querySelector("#error-stack")?.textContent ?? "";
    return (shown ? `${title} ${stack}` : `render phase: ${phase ?? "unknown"}`).trim();
  });
  return failed?.slice(0, 400);
}

async function waitForDocs(page: Page): Promise<string | undefined> {
  try {
    await page
      .locator(".sbdocs-content")
      .first()
      .waitFor({ state: "attached", timeout: RENDER_TIMEOUT });
  } catch {
    return "Docs page did not render (.sbdocs-content never appeared).";
  }
  await page.waitForTimeout(250);
  return page.evaluate(() =>
    document.body.classList.contains("sb-show-errordisplay")
      ? `Docs page crashed: ${(document.querySelector("#error-message")?.textContent ?? "").trim()}`.slice(
          0,
          400,
        )
      : undefined,
  );
}

export async function sweepStorybook(opts: {
  browser: Browser;
  baseUrl: string;
  themes: string[];
  filter?: string;
  concurrency: number;
}): Promise<RunResult[]> {
  const index = (await (await fetch(`${opts.baseUrl}/index.json`)).json()) as {
    entries: Record<string, IndexEntry>;
  };
  const entries = Object.values(index.entries).filter(
    (e) => !opts.filter || e.id.includes(opts.filter),
  );
  const stories = entries.filter((e) => e.type === "story");
  const docs = entries.filter((e) => e.type === "docs");
  if (stories.length === 0) throw new Error("No stories found in Storybook's index.json");

  const jobs = opts.themes.flatMap((theme) => [
    ...stories.map((story) => ({ theme, story, kind: "story" as const })),
    ...docs.map((story) => ({ theme, story, kind: "docs" as const })),
  ]);
  const context = await opts.browser.newContext({ viewport: { width: 900, height: 700 } });
  const pages = await Promise.all(
    Array.from({ length: opts.concurrency }, () => context.newPage()),
  );
  const free = [...pages];

  const results = await mapPool(jobs, opts.concurrency, async ({ theme, story, kind }) => {
    const page = free.pop() as Page;
    const pageErrors: string[] = [];
    const onError = (e: Error) => pageErrors.push(e.message.slice(0, 200));
    page.on("pageerror", onError);
    try {
      await page.goto(
        `${opts.baseUrl}/iframe.html?id=${story.id}&viewMode=${kind}&globals=theme:${theme}`,
        { waitUntil: "load" },
      );
      // Docs pages are smoke-checked only (they must render without errors): their surrounding UI
      // is Storybook's own, so axe there would report Storybook, not this design system.
      const storyError = kind === "docs" ? await waitForDocs(page) : await waitForStory(page);
      const violations =
        storyError || kind === "docs" ? [] : await runAxe(page, COMPONENT_RULES_OFF);
      const error =
        storyError ?? (pageErrors.length > 0 ? `Uncaught: ${pageErrors[0]}` : undefined);
      return {
        target: "storybook" as const,
        name: kind === "docs" ? `${story.title} (docs page)` : `${story.title} / ${story.name}`,
        theme,
        violations,
        ...(error ? { error } : {}),
      };
    } finally {
      page.off("pageerror", onError);
      free.push(page);
    }
  });
  await context.close();
  return results;
}
