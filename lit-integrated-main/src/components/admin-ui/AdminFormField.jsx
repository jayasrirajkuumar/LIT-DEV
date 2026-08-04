import React from "react";

export function AdminFormField({
  label,
  hint,
  error,
  required = false,
  children,
  className = "",
  htmlFor,
}) {
  return (
    <label className={`adm-field ${error ? "adm-field--error" : ""} ${className}`.trim()} htmlFor={htmlFor}>
      {label && (
        <span className="adm-field__label">
          {label}
          {required && <span className="adm-field__required" aria-hidden="true">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="adm-field__hint">{hint}</span>}
      {error && <span className="adm-field__error" role="alert">{error}</span>}
    </label>
  );
}

export function AdminInput({ className = "", ...props }) {
  return <input className={`adm-input ${className}`.trim()} {...props} />;
}

export function AdminSelect({ className = "", children, ...props }) {
  return (
    <select className={`adm-select ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

export function AdminTextarea({ className = "", ...props }) {
  return <textarea className={`adm-textarea ${className}`.trim()} {...props} />;
}

export function AdminSwitch({ checked, onChange, label, id, className = "" }) {
  const inputId = id || `adm-switch-${label?.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label className={`adm-switch ${className}`.trim()} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="adm-switch__input"
        checked={checked}
        onChange={onChange}
        role="switch"
        aria-checked={checked}
      />
      <span className="adm-switch__track" aria-hidden="true" />
      {label && <span className="adm-switch__label">{label}</span>}
    </label>
  );
}

export function AdminCheckbox({ checked, onChange, label, id, className = "" }) {
  const inputId = id || `adm-check-${label?.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label className={`adm-checkbox ${className}`.trim()} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="adm-checkbox__input"
        checked={checked}
        onChange={onChange}
      />
      <span className="adm-checkbox__box" aria-hidden="true" />
      {label && <span className="adm-checkbox__label">{label}</span>}
    </label>
  );
}
