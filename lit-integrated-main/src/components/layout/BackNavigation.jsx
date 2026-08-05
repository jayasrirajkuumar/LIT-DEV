import React from "react";
import { useNavigate } from "react-router-dom";

const BackNavigation = ({ label = "Back", fallbackTo = "/shop" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    const historyIdx = window.history.state?.idx;
    if (typeof historyIdx === "number" && historyIdx > 0) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo);
  };

  return (
    <button type="button" className="mb-4 inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" onClick={handleBack} aria-label={label}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      <span className="truncate">{label}</span>
    </button>
  );
};

export default BackNavigation;
