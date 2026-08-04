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
      className="adm-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={[`adm-modal`, `adm-modal--${size}`, className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "adm-modal-title" : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="adm-modal__header">
            <div>
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
        <div className="adm-modal__body">{children}</div>
        {footer && <div className="adm-modal__footer">{footer}</div>}
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
