import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import type { alertVariants } from "./Alert.variants";

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** @default "info" */
  variant?: AlertVariant;
  /** Short heading. */
  title?: ReactNode;
  /** Replace the default icon, or pass `false` to hide it. */
  icon?: ReactNode | false;
  /** Shows a dismiss button that calls this handler. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. @default "Dismiss" */
  dismissLabel?: string;
  /** Description. */
  children?: ReactNode;
}
