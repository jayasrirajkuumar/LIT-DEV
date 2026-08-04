import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackNavigation.css";

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
    <button type="button" className="lit-back-nav" onClick={handleBack} aria-label={label}>
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
      <span>{label}</span>
    </button>
  );
};

export default BackNavigation;
