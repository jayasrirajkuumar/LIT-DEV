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
    <header className={`adm-page-header min-w-0 max-w-full ${className}`.trim()}>
      <div className="adm-page-header__main flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="min-w-0 flex-1">
          {breadcrumbs && <div className="adm-page-header__crumbs mb-2 overflow-x-auto whitespace-nowrap text-xs text-[var(--adm-text-muted)]">{breadcrumbs}</div>}
          {title && <h1 className="adm-page-header__title break-words text-[clamp(1.375rem,1.05rem+1vw,2.5rem)] font-bold tracking-tight text-[var(--adm-text)]">{title}</h1>}
          {subtitle && <p className="adm-page-header__subtitle mt-2 max-w-3xl break-words text-sm leading-6 text-[var(--adm-text-muted)] sm:text-base">{subtitle}</p>}
        </div>
        {actions && <div className="adm-page-header__actions flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end [&>*]:max-sm:flex-1">{actions}</div>}
      </div>
      {toolbar && <div className="adm-page-header__toolbar mt-4 flex w-full min-w-0 flex-wrap items-center gap-3 rounded-xl border border-[var(--adm-border)] bg-white p-3 shadow-sm [&>*]:max-sm:w-full">{toolbar}</div>}
    </header>
  );
}
