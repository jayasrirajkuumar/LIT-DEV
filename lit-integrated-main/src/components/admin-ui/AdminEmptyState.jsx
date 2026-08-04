import React from "react";
import AdminButton from "./AdminButton";

export default function AdminEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={[
        "adm-empty",
        compact ? "adm-empty--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="adm-empty__visual" aria-hidden="true">
        {icon || (
          <svg viewBox="0 0 120 120" className="adm-empty__illustration">
            <defs>
              <linearGradient id="admEmptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <rect x="20" y="28" width="80" height="64" rx="12" fill="url(#admEmptyGrad)" />
            <rect x="32" y="44" width="56" height="8" rx="4" fill="rgba(255,255,255,0.25)" />
            <rect x="32" y="60" width="40" height="8" rx="4" fill="rgba(255,255,255,0.15)" />
          </svg>
        )}
      </div>
      {title && <h3 className="adm-empty__title">{title}</h3>}
      {description && <p className="adm-empty__desc">{description}</p>}
      {actionLabel && onAction && (
        <AdminButton onClick={onAction}>{actionLabel}</AdminButton>
      )}
    </div>
  );
}
