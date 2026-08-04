import React from "react";
import AdminCard from "./AdminCard";

export default function AdminQuickAction({ icon, title, description, onClick, className = "" }) {
  return (
    <button type="button" className={`adm-quick-action ${className}`.trim()} onClick={onClick}>
      <AdminCard hover padding="md" className="adm-quick-action__card">
        <div className="adm-quick-action__icon">{icon}</div>
        <div>
          <div className="adm-quick-action__title">{title}</div>
          {description && <div className="adm-quick-action__desc">{description}</div>}
        </div>
      </AdminCard>
    </button>
  );
}
