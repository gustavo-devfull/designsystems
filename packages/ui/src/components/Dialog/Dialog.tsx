import * as RadixDialog from "@radix-ui/react-dialog";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";
import { CloseGlyph } from "../../internal/icons";
import { usePortalContainer } from "../../theme/portal";
import { IconButton } from "../IconButton";
import type { DialogContentProps } from "./Dialog.types";
import { dialogContentVariants } from "./Dialog.variants";

/** State container. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). */
export const Dialog = RadixDialog.Root;
/** Use with `asChild` to make your own Button the trigger. */
export const DialogTrigger = RadixDialog.Trigger;
/** Closes the dialog. Use with `asChild` around a Button. */
export const DialogClose = RadixDialog.Close;

/**
 * Modal dialog. Radix provides the hard accessibility parts: focus moves in on open, is trapped,
 * returns to the trigger on close; `Esc` closes; the rest of the page is inert (`aria-hidden`)
 * and scroll-locked. We add the visual layer and make `title` mandatory.
 *
 * DOM order is content first, close button last, so initial focus lands on the first control of
 * the body (e.g. "Cancel") rather than the ✕.
 */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  {
    title,
    description,
    size = "md",
    showClose = true,
    closeLabel = "Close",
    className,
    children,
    ...props
  },
  ref,
) {
  const container = usePortalContainer();
  return (
    <RadixDialog.Portal container={container}>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-background-overlay" />
      <RadixDialog.Content
        ref={ref}
        // Without a description Radix warns; opting out is explicit.
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {/* A <div>, not <header>: inside a dialog a <header> would count as a second page banner landmark. */}
        <div className="flex flex-col gap-xs pe-xl">
          <RadixDialog.Title className="text-lg font-semibold text-text-primary">
            {title}
          </RadixDialog.Title>
          {description ? (
            <RadixDialog.Description className="text-sm text-text-secondary">
              {description}
            </RadixDialog.Description>
          ) : null}
        </div>
        {children}
        {showClose ? (
          <RadixDialog.Close asChild>
            <IconButton aria-label={closeLabel} size="sm" className="absolute end-sm top-sm">
              <CloseGlyph />
            </IconButton>
          </RadixDialog.Close>
        ) : null}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});

export const DialogFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-center justify-end gap-sm", className)}
        {...props}
      />
    );
  },
);
