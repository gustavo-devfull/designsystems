import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import type { avatarVariants } from "./Avatar.variants";

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Person or entity name. Source of the initials fallback and the default accessible name. */
  name: string;
  /** Image URL. If it is missing or fails to load, initials are shown. */
  src?: string;
  /**
   * Accessible name. Defaults to `name`. Pass `""` when the name is already written next to the
   * avatar, so it is not announced twice.
   */
  alt?: string;
  /** @default "md" */
  size?: AvatarSize;
}
