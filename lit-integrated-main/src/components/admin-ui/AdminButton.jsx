import React from "react";

const VARIANTS = ["primary", "secondary", "danger", "ghost", "outline"];
const SIZES = ["sm", "md", "lg"];

export default function AdminButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon = null,
  iconOnly = false,
  className = "",
  type = "button",
  ...props
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : "primary";
  const safeSize = SIZES.includes(size) ? size : "md";

  return (
    <button
      type={type}
      className={[
        "adm-btn",
        `adm-btn--${safeVariant}`,
        `adm-btn--${safeSize}`,
        iconOnly ? "adm-btn--icon" : "",
        loading ? "adm-btn--loading" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="adm-btn__spinner" aria-hidden="true" />}
      {icon && <span className="adm-btn__icon">{icon}</span>}
      {!iconOnly && <span className="adm-btn__label">{children}</span>}
    </button>
  );
}
