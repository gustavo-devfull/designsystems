import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import {
  AlertTriangleGlyph,
  CheckCircleGlyph,
  CloseGlyph,
  InfoGlyph,
  XCircleGlyph,
} from "../../internal/icons";
import { IconButton } from "../IconButton";
import type { AlertProps } from "./Alert.types";
import { alertIconColor, alertVariants } from "./Alert.variants";

const defaultIcons = {
  info: InfoGlyph,
  success: CheckCircleGlyph,
  warning: AlertTriangleGlyph,
  error: XCircleGlyph,
} as const;

/**
 * Inline, persistent message. `error` and `warning` use `role="alert"` (announced immediately);
 * `info` and `success` use `role="status"` (announced politely). Override with the `role` prop.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant = "info",
    title,
    icon,
    onDismiss,
    dismissLabel = "Dismiss",
    className,
    children,
    ...props
  },
  ref,
) {
  const DefaultIcon = defaultIcons[variant];
  const urgent = variant === "error" || variant === "warning";

  return (
    <div
      ref={ref}
      role={urgent ? "alert" : "status"}
      data-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon === false ? null : (
        <span
          aria-hidden="true"
          className={cn("mt-0.5 inline-flex shrink-0", alertIconColor[variant])}
        >
          {icon ?? <DefaultIcon className="size-5" />}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-sm">{children}</div> : null}
      </div>
      {onDismiss ? (
        <IconButton
          aria-label={dismissLabel}
          size="sm"
          className="-my-xs -me-xs"
          onClick={onDismiss}
        >
          <CloseGlyph />
        </IconButton>
      ) : null}
    </div>
  );
});
