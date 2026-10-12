import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import type { AvatarProps } from "./Avatar.types";
import { avatarVariants } from "./Avatar.variants";

/** "Ada Lovelace" → "AL"; "Cher" → "C". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, alt, size = "md", className, ...props },
  ref,
) {
  const [failed, setFailed] = useState(false);
  // A new source deserves a new attempt.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const label = alt ?? name;
  const decorative = label === "";
  const showImage = Boolean(src) && !failed;

  return (
    <span
      ref={ref}
      role={decorative || showImage ? undefined : "img"}
      aria-label={decorative || showImage ? undefined : label}
      aria-hidden={decorative && !showImage ? true : undefined}
      data-size={size}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={label}
          onError={() => {
            setFailed(true);
          }}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
});
