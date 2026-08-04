import React from "react";
import BackNavigation from "./BackNavigation";
import "./PageShell.css";

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
  <div className={`lit-page-shell ${narrow ? "lit-page-shell--narrow" : ""} ${className}`.trim()}>
    <div className={`lit-page-shell__inner ${narrow ? "lit-page-shell__inner--narrow" : ""}`}>
      {showBack && backLabel && <BackNavigation label={backLabel} fallbackTo={backTo} />}

      {(title || subtitle || headerAction) && (
        <header className="lit-page-shell__header">
          <div className="lit-page-shell__header-text">
            {title && <h1 className="lit-page-title">{title}</h1>}
            {subtitle && <p className="lit-page-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="lit-page-shell__header-action">{headerAction}</div>}
        </header>
      )}

      <div className="lit-page-shell__content">{children}</div>
    </div>
  </div>
);

export default PageShell;
