import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import type { cardVariants } from "./Card.variants";

export type CardVariant = NonNullable<VariantProps<typeof cardVariants>["variant"]>;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Surface treatment. @default "outline" */
  variant?: CardVariant;
  /** Element to render. Use `section`/`article` when the card is a landmark/standalone item. @default "div" */
  as?: "div" | "section" | "article" | "aside";
}

export type CardSectionProps = HTMLAttributes<HTMLDivElement>;

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level. Pick the one that fits the page outline — never for size.
   * @default "h3"
   */
  as?: "h2" | "h3" | "h4" | "h5" | "h6" | "p";
}
