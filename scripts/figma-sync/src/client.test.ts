import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FigmaApiError, HttpFigmaClient } from "./client.ts";
import { figma } from "./helpers.ts";

const TOKEN = "figd_super-secret-token";
const reply = (status: number, body: unknown = {}, headers: Record<string, string> = {}) =>
  (() =>
    Promise.resolve(
      new Response(JSON.stringify(body), { status, headers }),
    )) as unknown as typeof fetch;

describe("HttpFigmaClient", () => {
  it("calls the variables endpoint with the token in a header, never in the URL", async () => {
    let seen: { url: string; headers: Headers } | undefined;
    const fetchStub = ((url: string, init: RequestInit) => {
      seen = { url, headers: new Headers(init.headers) };
      return Promise.resolve(
        new Response(JSON.stringify(figma({ collections: [], variables: [] }))),
      );
    }) as unknown as typeof fetch;
    await new HttpFigmaClient({
      token: TOKEN,
      fileKey: "AbC123",
      fetch: fetchStub,
    }).getLocalVariables();
    assert.ok(seen, "fetch was not called");
    assert.equal(seen.url, "https://api.figma.com/v1/files/AbC123/variables/local");
    assert.equal(seen.headers.get("x-figma-token"), TOKEN);
    assert.ok(!seen.url.includes(TOKEN));
  });

  for (const [status, expected] of [
    [403, /file_variables:read.*Enterprise/],
    [404, /FIGMA_FILE_KEY/],
    [429, /Rate limited.*retry after 30s/],
    [500, /status 500/],
  ] as const) {
    it(`explains HTTP ${status} and never leaks the token`, async () => {
      const client = new HttpFigmaClient({
        token: TOKEN,
        fileKey: "k",
        fetch: reply(status, {}, { "retry-after": "30" }),
      });
      await assert.rejects(client.getLocalVariables(), (error: unknown) => {
        assert.ok(error instanceof FigmaApiError);
        assert.equal(error.status, status);
        assert.match(error.message, expected);
        assert.ok(!error.message.includes(TOKEN));
        return true;
      });
    });
  }

  it("fromEnv reads credentials from the environment and fails with guidance when missing", () => {
    assert.throws(() => HttpFigmaClient.fromEnv({}), /FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY/);
    assert.doesNotThrow(() =>
      HttpFigmaClient.fromEnv({ FIGMA_ACCESS_TOKEN: "t", FIGMA_FILE_KEY: "k" }),
    );
  });
});
