import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Violation } from "./axe.ts";
import { classify, type RunResult } from "./report.ts";

const violation = (impact: Violation["impact"]): Violation => ({
  id: "x",
  impact,
  help: "h",
  helpUrl: "u",
  target: "t",
  detail: "d",
  nodes: 1,
});
const run = (name: string, violations: Violation[], error?: string): RunResult => ({
  target: "storybook",
  name,
  theme: "light",
  violations,
  ...(error ? { error } : {}),
});

describe("classify", () => {
  it("fails on critical and serious, warns on lower impacts (default gate: serious)", () => {
    const { failing, warnings } = classify(
      [
        run("a", [violation("critical")]),
        run("b", [violation("serious")]),
        run("c", [violation("moderate")]),
      ],
      "serious",
    );
    assert.deepEqual(
      failing.map((r) => r.name),
      ["a", "b"],
    );
    assert.deepEqual(
      warnings.map((r) => r.name),
      ["c"],
    );
  });

  it("splits one run into blocking and advisory findings", () => {
    const { failing, warnings } = classify(
      [run("a", [violation("serious"), violation("minor")])],
      "serious",
    );
    assert.equal(failing[0]?.violations.length, 1);
    assert.equal(warnings[0]?.violations.length, 1);
  });

  it("a stricter gate turns advisory findings into failures", () => {
    const { failing } = classify([run("a", [violation("minor")])], "minor");
    assert.equal(failing.length, 1);
  });

  it("always fails on rendering/interaction errors, even with no violations", () => {
    const { failing } = classify([run("a", [], "play function threw")], "critical");
    assert.equal(failing.length, 1);
  });

  it("passes when everything is clean", () => {
    const { failing, warnings } = classify([run("a", [])], "serious");
    assert.equal(failing.length + warnings.length, 0);
  });
});
