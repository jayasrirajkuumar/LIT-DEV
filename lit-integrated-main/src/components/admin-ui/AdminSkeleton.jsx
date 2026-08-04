import React from "react";

export function AdminSkeleton({ className = "", style }) {
  return <span className={`adm-skeleton ${className}`.trim()} style={style} aria-hidden="true" />;
}

export function AdminSkeletonCard({ lines = 3, className = "" }) {
  return (
    <div className={`adm-skeleton-card ${className}`.trim()} aria-hidden="true">
      <AdminSkeleton className="adm-skeleton--title" />
      {Array.from({ length: lines }).map((_, index) => (
        <AdminSkeleton key={index} className="adm-skeleton--line" />
      ))}
    </div>
  );
}

export function AdminSkeletonTable({ columns = 5, rows = 5, className = "" }) {
  return (
    <div className={`adm-skeleton-table ${className}`.trim()} aria-hidden="true">
      <div className="adm-skeleton-table__head">
        {Array.from({ length: columns }).map((_, index) => (
          <AdminSkeleton key={index} className="adm-skeleton--cell" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="adm-skeleton-table__row">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <AdminSkeleton key={colIndex} className="adm-skeleton--cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminSkeletonForm({ fields = 6, className = "" }) {
  return (
    <div className={`adm-skeleton-form ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="adm-skeleton-form__field">
          <AdminSkeleton className="adm-skeleton--label" />
          <AdminSkeleton className="adm-skeleton--input" />
        </div>
      ))}
    </div>
  );
}

export default AdminSkeleton;
