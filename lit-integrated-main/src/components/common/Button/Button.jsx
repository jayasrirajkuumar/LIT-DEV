import React from "react";

const VARIANTS = ["primary", "secondary", "outline", "ghost", "danger", "gold"];
const SIZES = ["sm", "md", "lg"];

/**
 * Global LIT button — pill purple gradient (primary) or outline (secondary).
 * @example <Button variant="primary">Subscribe</Button>
 * @example <Button variant="outline" block>Add to Cart</Button>
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  type = "button",
  as: Component = "button",
  ...props
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : "primary";
  const safeSize = SIZES.includes(size) ? size : "md";

  const classes = [
    "lit-btn",
    `lit-btn--${safeVariant}`,
    safeSize !== "md" ? `lit-btn--${safeSize}` : "",
    block ? "lit-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component type={Component === "button" ? type : undefined} className={classes} {...props}>
      {children}
    </Component>
  );
}
