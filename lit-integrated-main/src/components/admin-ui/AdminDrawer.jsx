import React, { useEffect } from "react";

export default function AdminDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
  className = "",
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`adm-drawer-overlay ${open ? "adm-drawer-overlay--open" : ""}`.trim()}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={[
          "adm-drawer",
          `adm-drawer--${width}`,
          open ? "adm-drawer--open" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "adm-drawer-title" : undefined}
        aria-hidden={!open}
      >
        <div className="adm-drawer__header">
          <div>
            {title && (
              <h2 id="adm-drawer-title" className="adm-drawer__title">
                {title}
              </h2>
            )}
            {subtitle && <p className="adm-drawer__subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="adm-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div className="adm-drawer__body">{children}</div>
        {footer && <div className="adm-drawer__footer">{footer}</div>}
      </aside>
    </>
  );
}
