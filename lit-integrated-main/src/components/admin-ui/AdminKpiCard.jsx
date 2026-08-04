import React from "react";
import AdminCard from "./AdminCard";

export default function AdminKpiCard({
  icon,
  label,
  value,
  description,
  trend,
  trendLabel = "vs last period",
  className = "",
}) {
  return (
    <AdminCard hover className={`adm-kpi ${className}`.trim()}>
      <div className="adm-kpi__top">
        <div className="adm-kpi__icon">{icon}</div>
        <span className="adm-kpi__label">{label}</span>
      </div>
      <div className="adm-kpi__value">{value}</div>
      {description && <p className="adm-kpi__desc">{description}</p>}
      <div className="adm-kpi__trend">
        <span className="adm-kpi__trend-value">{trend ?? "—"}</span>
        <span className="adm-kpi__trend-label">{trendLabel}</span>
      </div>
    </AdminCard>
  );
}
