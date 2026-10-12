import { forwardRef, type ReactNode, type SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children" | "title"> {
  /** Rendered size in px (width and height). @default 20 */
  size?: number | string;
  /**
   * Accessible name. Provide it only when the icon is the sole content of a control or conveys
   * meaning on its own; otherwise the icon is decorative and hidden from assistive technology.
   */
  title?: string;
}

/** Creates a 24×24 stroke icon (currentColor) from SVG child nodes. */
export function createIcon(displayName: string, paths: ReactNode) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { size = 20, title, ...props },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        {...props}
      >
        {paths}
      </svg>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}
