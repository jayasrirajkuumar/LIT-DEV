import React, { useEffect } from "react";
import AdminButton from "./AdminButton";

export default function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
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

  if (!open) return null;

  return (
    <div
      className="adm-modal-overlay fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-lg"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={[
          "adm-modal relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-[var(--adm-radius-xl)] border border-[var(--adm-border-accent)] bg-[var(--adm-glass-strong)] shadow-[var(--adm-shadow-lg)]",
          size === "sm" ? "max-w-[440px]" : size === "lg" ? "max-w-[880px]" : "max-w-[640px]",
          className,
        ].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "adm-modal-title" : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="adm-modal__header flex shrink-0 items-start justify-between gap-4 border-b border-[var(--adm-border)] px-6 py-4 max-sm:px-4">
            <div className="min-w-0">
              {title && (
                <h2 id="adm-modal-title" className="adm-modal__title">
                  {title}
                </h2>
              )}
              {description && <p className="adm-modal__desc">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                className="adm-modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="adm-modal__body min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 max-sm:p-4">{children}</div>
        {footer && <div className="adm-modal__footer flex shrink-0 flex-wrap items-center justify-end gap-4 border-t border-[var(--adm-border)] px-6 py-4 max-sm:px-4 [&>*]:max-sm:flex-1">{footer}</div>}
      </div>
    </div>
  );
}

export function AdminConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
}) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </AdminButton>
        </>
      }
    />
  );
}
