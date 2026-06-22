import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const AdminPageHeader = ({ title, backPath, children }) => {
  const navigate = useNavigate();

  return (
    <header className="editor-header purple-theme-header">
      <div className="editor-header-left">
        {/* THIS BUTTON HAS A FIXED PATH*/}
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="editor-back-button"
        >
          <FaArrowLeft />
        </button>
        <h1>{title}</h1>
      </div>
      <div className="editor-actions">{children}</div>
    </header>
  );
};

export default AdminPageHeader;
