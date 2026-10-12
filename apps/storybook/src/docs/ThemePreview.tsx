import { Button, Spinner } from "@sette/ui";
import { ArrowRightIcon } from "@design-system/icons";
import type { Theme } from "./tokens";

function Panel({ theme }: { theme: Theme }) {
  return (
    <div
      data-theme={theme}
      className="flex min-w-80 flex-1 flex-col gap-md rounded-surface border border-border-default bg-background-primary p-lg text-text-primary"
    >
      <h4 className="text-lg font-semibold capitalize">{theme} theme</h4>
      <p className="text-sm text-text-secondary">
        Same components, same classes — only <code>data-theme</code> differs.
      </p>
      <div className="flex flex-wrap gap-sm">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger" rightIcon={<ArrowRightIcon />}>
          Danger
        </Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex items-center gap-sm rounded-surface bg-background-elevated p-md shadow-low">
        <Spinner className="text-action-primary" />
        <span className="text-sm text-text-secondary">Elevated surface</span>
      </div>
    </div>
  );
}

/** Light and dark rendered together, regardless of the toolbar theme. */
export function ThemePreview() {
  return (
    <div className="mb-lg flex flex-wrap gap-md">
      <Panel theme="light" />
      <Panel theme="dark" />
    </div>
  );
}
