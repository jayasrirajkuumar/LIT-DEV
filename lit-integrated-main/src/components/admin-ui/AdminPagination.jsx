import React from "react";
import AdminButton from "./AdminButton";

export default function AdminPagination({ page, totalPages, total, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="adm-pagination">
      <span className="adm-pagination__info">
        Page {page} of {totalPages} ({total} records)
      </span>
      <div className="adm-pagination__controls">
        <AdminButton size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </AdminButton>
        <AdminButton
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </AdminButton>
      </div>
    </div>
  );
}
