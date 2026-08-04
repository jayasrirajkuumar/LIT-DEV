import React from "react";

export default function AdminFormSection({ title, description, children, className = "" }) {
  return (
    <section className={`adm-form-section ${className}`.trim()}>
      {(title || description) && (
        <header className="adm-form-section__header">
          {title && <h3 className="adm-form-section__title">{title}</h3>}
          {description && <p className="adm-form-section__desc">{description}</p>}
        </header>
      )}
      <div className="adm-form-section__body">{children}</div>
    </section>
  );
}
