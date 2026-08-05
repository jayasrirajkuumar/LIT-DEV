import React from "react";

export default function AdminCard({
  children,
  className = "",
  hover = false,
  padding = "md",
  as: Tag = "div",
  ...props
}) {
  return (
    <Tag
      className={[
        "adm-card",
        "h-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--adm-border)] bg-white shadow-[var(--adm-shadow-sm)] transition duration-200",
        hover ? "adm-card--hover" : "",
        padding ? `adm-card--pad-${padding}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function AdminCardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`adm-card__header flex min-w-0 flex-wrap items-start justify-between gap-3 ${className}`.trim()}>
      <div className="min-w-0 flex-1">
        {title && <h3 className="adm-card__title break-words text-base font-semibold text-[var(--adm-text)] sm:text-lg">{title}</h3>}
        {subtitle && <p className="adm-card__subtitle mt-1 break-words text-sm text-[var(--adm-text-muted)]">{subtitle}</p>}
      </div>
      {action && <div className="adm-card__action shrink-0">{action}</div>}
    </div>
  );
}

export function AdminCardBody({ children, className = "" }) {
  return <div className={`adm-card__body min-w-0 max-w-full ${className}`.trim()}>{children}</div>;
}
