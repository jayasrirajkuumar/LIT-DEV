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
        className={`adm-drawer-overlay fixed inset-0 z-[1500] bg-black/55 transition-opacity duration-200 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`.trim()}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={[
          "adm-drawer fixed inset-y-0 right-0 z-[1501] flex h-dvh w-full flex-col border-l border-[var(--adm-border-accent)] bg-[var(--adm-surface)] shadow-[var(--adm-shadow-lg)] transition-transform duration-300",
          width === "lg" ? "max-w-[640px]" : "max-w-[480px]",
          open ? "translate-x-0" : "translate-x-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "adm-drawer-title" : undefined}
        aria-hidden={!open}
      >
        <div className="adm-drawer__header flex shrink-0 justify-between gap-3 border-b border-[var(--adm-border)] px-6 py-4 max-sm:px-4">
          <div className="min-w-0">
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
        <div className="adm-drawer__body min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 max-sm:p-4">{children}</div>
        {footer && <div className="adm-drawer__footer mt-auto flex shrink-0 flex-wrap gap-3 border-t border-[var(--adm-border)] px-6 py-4 max-sm:px-4">{footer}</div>}
      </aside>
    </>
  );
}
