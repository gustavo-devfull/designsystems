import { readFileSync } from "node:fs";
import type { FigmaVariablesResponse } from "./figma-types.ts";

/** Where variables come from. The pipeline only depends on this interface. */
export interface FigmaClient {
  getLocalVariables: () => Promise<FigmaVariablesResponse>;
}

export class FigmaApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "FigmaApiError";
    this.status = status;
  }
}

const explain = (status: number, retryAfter: string | null): string => {
  switch (status) {
    case 401:
    case 403:
      return (
        "Figma rejected the token. The variables API needs a token with the `file_variables:read` scope " +
        "and a file in an Enterprise organisation."
      );
    case 404:
      return "File not found. Check FIGMA_FILE_KEY (the part after /design/ in the file URL).";
    case 429:
      return `Rate limited by Figma${retryAfter ? `; retry after ${retryAfter}s` : ""}.`;
    default:
      return `Figma API request failed with status ${status}.`;
  }
};

/**
 * Reads from the Figma REST API. The token is only ever taken from the environment and is never
 * logged or included in error messages.
 */
export class HttpFigmaClient implements FigmaClient {
  readonly #token: string;
  readonly #fileKey: string;
  readonly #fetch: typeof fetch;

  constructor(options: { token: string; fileKey: string; fetch?: typeof fetch }) {
    this.#token = options.token;
    this.#fileKey = options.fileKey;
    this.#fetch = options.fetch ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): HttpFigmaClient {
    const token = env["FIGMA_ACCESS_TOKEN"];
    const fileKey = env["FIGMA_FILE_KEY"];
    if (!token || !fileKey) {
      throw new Error(
        "Set FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY (see .env.example), or pass --fixture <file> to run offline.",
      );
    }
    return new HttpFigmaClient({ token, fileKey });
  }

  async getLocalVariables(): Promise<FigmaVariablesResponse> {
    const response = await this.#fetch(
      `https://api.figma.com/v1/files/${encodeURIComponent(this.#fileKey)}/variables/local`,
      { headers: { "X-Figma-Token": this.#token } },
    );
    if (!response.ok) {
      throw new FigmaApiError(
        response.status,
        explain(response.status, response.headers.get("retry-after")),
      );
    }
    const body = (await response.json()) as FigmaVariablesResponse;
    if (body.error) throw new FigmaApiError(body.status, "Figma returned an error payload.");
    return body;
  }
}

/** Reads a saved response: used for tests, demos and CI without credentials. */
export class FixtureFigmaClient implements FigmaClient {
  readonly #path: string;
  constructor(path: string) {
    this.#path = path;
  }
  getLocalVariables(): Promise<FigmaVariablesResponse> {
    return Promise.resolve(JSON.parse(readFileSync(this.#path, "utf8")) as FigmaVariablesResponse);
  }
}
