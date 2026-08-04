import React from "react";

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;

  return (
    <nav className="mp-pagination" aria-label="Product pagination">
      <button
        type="button"
        className="mp-btn mp-btn-outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="mp-pagination-label">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="mp-btn mp-btn-outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
