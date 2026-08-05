import React from "react";
import BackNavigation from "./BackNavigation";

const PageShell = ({
  children,
  title,
  subtitle,
  backLabel,
  backTo = "/shop",
  showBack = true,
  narrow = false,
  className = "",
  headerAction = null,
}) => (
  <div className={`min-h-[calc(100vh-var(--lit-nav-height))] w-full max-w-full px-[var(--lit-page-gutter)] pb-[var(--lit-footer-gap)] pt-[calc(var(--lit-nav-height)+var(--lit-space-6))] max-md:pb-[var(--lit-space-12)] max-md:pt-[calc(var(--lit-nav-height)+var(--lit-space-4))] ${className}`.trim()}>
    <div className={`mx-auto w-full min-w-0 ${narrow ? "max-w-[var(--lit-max-width)]" : "max-w-[var(--lit-max-width-wide)]"}`}>
      {showBack && backLabel && <BackNavigation label={backLabel} fallbackTo={backTo} />}

      {(title || subtitle || headerAction) && (
        <header className="mb-[var(--lit-space-8)] flex min-w-0 flex-wrap items-start justify-between gap-[var(--lit-space-4)] max-md:mb-[var(--lit-space-6)]">
          <div className="min-w-0 flex-1">
            {title && <h1 className="lit-page-title">{title}</h1>}
            {subtitle && <p className="m-0 max-w-[60ch] break-words font-[var(--lit-font-body)] text-[length:var(--lit-text-sm)] leading-[var(--lit-leading-normal)] text-[var(--lit-text-muted)]">{subtitle}</p>}
          </div>
          {headerAction && <div className="w-full shrink-0 sm:w-auto">{headerAction}</div>}
        </header>
      )}

      <div className="flex min-w-0 max-w-full flex-col gap-[var(--lit-space-6)]">{children}</div>
    </div>
  </div>
);

export default PageShell;
