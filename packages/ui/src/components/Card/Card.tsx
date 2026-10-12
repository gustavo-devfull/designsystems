import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { CardProps, CardSectionProps, CardTitleProps } from "./Card.types";
import { cardVariants } from "./Card.variants";

/** Surface container. Compose with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "outline", as: Tag = "div", className, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref}
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("flex flex-col gap-xs p-lg pb-0", className)} {...props} />;
});

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as: Tag = "h3", className, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cn("text-lg font-semibold text-text-primary", className)}
      {...props}
    />
  );
});

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn("text-sm text-text-secondary", className)} {...props} />;
});

export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("p-lg text-md", className)} {...props} />;
});

export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(function CardFooter(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("flex items-center gap-sm p-lg pt-0", className)} {...props} />
  );
});
