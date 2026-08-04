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
    <div className={`adm-card__header ${className}`.trim()}>
      <div>
        {title && <h3 className="adm-card__title">{title}</h3>}
        {subtitle && <p className="adm-card__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="adm-card__action">{action}</div>}
    </div>
  );
}

export function AdminCardBody({ children, className = "" }) {
  return <div className={`adm-card__body ${className}`.trim()}>{children}</div>;
}
