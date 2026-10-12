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
 * Waits until Storybook has finished rendering the story *and* its play function, so interaction
 * tests run and portalled UI (dialogs, tooltips) that a play function opens is present for axe.
 */
async function waitForStory(page: Page): Promise<string | undefined> {
  try {
    await page.waitForFunction(
      () => {
        const phase = (window as unknown as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender
          ?.phase;
        return phase === "completed" || phase === "errored" || phase === "aborted";
      },
      undefined,
      { timeout: RENDER_TIMEOUT },
    );
  } catch {
    return "Timed out waiting for the story (and its play function) to finish rendering.";
  }
  const failed = await page.evaluate(() => {
    const phase = (window as unknown as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase;
    const display = document.querySelector(".sb-errordisplay");
    const visible = document.body.classList.contains("sb-show-errordisplay");
    return phase !== "completed" || visible
      ? (display?.textContent ?? `render phase: ${phase ?? "unknown"}`).trim()
      : undefined;
  });
  return failed?.slice(0, 400);
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
  const stories = Object.values(index.entries).filter(
    (e) => e.type === "story" && (!opts.filter || e.id.includes(opts.filter)),
  );
  if (stories.length === 0) throw new Error("No stories found in Storybook's index.json");

  const jobs = opts.themes.flatMap((theme) => stories.map((story) => ({ theme, story })));
  const context = await opts.browser.newContext({ viewport: { width: 900, height: 700 } });
  const pages = await Promise.all(
    Array.from({ length: opts.concurrency }, () => context.newPage()),
  );
  const free = [...pages];

  const results = await mapPool(jobs, opts.concurrency, async ({ theme, story }) => {
    const page = free.pop() as Page;
    const pageErrors: string[] = [];
    const onError = (e: Error) => pageErrors.push(e.message.slice(0, 200));
    page.on("pageerror", onError);
    try {
      await page.goto(
        `${opts.baseUrl}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`,
        {
          waitUntil: "load",
        },
      );
      const storyError = await waitForStory(page);
      const violations = storyError ? [] : await runAxe(page, COMPONENT_RULES_OFF);
      const error =
        storyError ?? (pageErrors.length > 0 ? `Uncaught: ${pageErrors[0]}` : undefined);
      return {
        target: "storybook" as const,
        name: `${story.title} / ${story.name}`,
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
