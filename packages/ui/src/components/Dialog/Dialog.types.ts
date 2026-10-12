import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type * as RadixDialog from "@radix-ui/react-dialog";
import type { dialogContentVariants } from "./Dialog.variants";

export type DialogSize = NonNullable<VariantProps<typeof dialogContentVariants>["size"]>;

export interface DialogContentProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixDialog.Content>,
  "title" | "children"
> {
  /** Accessible name of the dialog, shown as its heading. **Required.** */
  title: ReactNode;
  /** Supporting text, announced after the title (`aria-describedby`). */
  description?: ReactNode;
  /** @default "md" */
  size?: DialogSize;
  /** Show the close (✕) button. @default true */
  showClose?: boolean;
  /** Accessible name of the close button. @default "Close" */
  closeLabel?: string;
  children?: ReactNode;
}
