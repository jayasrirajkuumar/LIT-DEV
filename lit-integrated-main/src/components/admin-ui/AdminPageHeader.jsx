import React from "react";

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  toolbar,
  className = "",
}) {
  return (
    <header className={`adm-page-header ${className}`.trim()}>
      <div className="adm-page-header__main">
        <div>
          {breadcrumbs && <div className="adm-page-header__crumbs">{breadcrumbs}</div>}
          {title && <h1 className="adm-page-header__title">{title}</h1>}
          {subtitle && <p className="adm-page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="adm-page-header__actions">{actions}</div>}
      </div>
      {toolbar && <div className="adm-page-header__toolbar">{toolbar}</div>}
    </header>
  );
}
