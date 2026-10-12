import type { ReactNode } from "react";

/** Two-column guidance block. Each side shows a live example plus a short rationale. */
export function DoDont({
  doExample,
  doText,
  dontExample,
  dontText,
}: {
  doExample: ReactNode;
  doText: string;
  dontExample: ReactNode;
  dontText: string;
}) {
  const card = "flex min-w-64 flex-1 flex-col gap-sm rounded-surface border p-md";
  return (
    <div className="my-lg flex flex-wrap gap-md">
      <figure className={`${card} border-feedback-success-border bg-feedback-success-subtle`}>
        <div className="flex min-h-16 items-center justify-center">{doExample}</div>
        <figcaption className="text-sm text-feedback-success">
          <strong>Do</strong> — {doText}
        </figcaption>
      </figure>
      <figure className={`${card} border-feedback-error-border bg-feedback-error-subtle`}>
        <div className="flex min-h-16 items-center justify-center">{dontExample}</div>
        <figcaption className="text-sm text-feedback-error">
          <strong>Don&apos;t</strong> — {dontText}
        </figcaption>
      </figure>
    </div>
  );
}
