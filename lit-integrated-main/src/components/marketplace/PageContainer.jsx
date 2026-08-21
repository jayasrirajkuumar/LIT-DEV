import React from "react";

/**
 * Reusable Luxury Page Container
 * Fluid marketplace container with a fixed 5px safe edge on every screen.
 */
const PageContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`lux-page-container ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
