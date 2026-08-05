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
        "min-h-10 max-w-full shrink-0 select-none gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:pointer-events-none disabled:opacity-50 max-sm:min-h-11",
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
      {icon && <span className="adm-btn__icon inline-flex shrink-0 items-center justify-center [&>svg]:size-[18px]">{icon}</span>}
      {!iconOnly && <span className="adm-btn__label truncate">{children}</span>}
    </button>
  );
}
