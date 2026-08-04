import React from "react";

const VARIANT_MAP = {
  active: "success",
  inactive: "neutral",
  draft: "neutral",
  archived: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  featured: "featured",
  new: "new",
  low: "warning",
  "in stock": "success",
  "out of stock": "danger",
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "warning",
  refunded: "neutral",
};

function resolveVariant(variant, label) {
  if (variant) return variant;
  const key = String(label || "").toLowerCase();
  return VARIANT_MAP[key] || "neutral";
}

export default function AdminBadge({
  children,
  variant,
  dot = false,
  className = "",
}) {
  const resolved = resolveVariant(variant, children);

  return (
    <span
      className={[
        "adm-badge",
        `adm-badge--${resolved}`,
        dot ? "adm-badge--dot" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

export function AdminStatusBadge({ status }) {
  return <AdminBadge variant={resolveVariant(null, status)}>{status}</AdminBadge>;
}
