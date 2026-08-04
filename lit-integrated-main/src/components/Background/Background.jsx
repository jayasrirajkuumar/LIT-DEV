import React from "react";
import "./Background.css";

const Background = ({ children, className = "" }) => {
  return (
    <div className={`background-container${className ? ` ${className}` : ""}`}>
      <div className="background-image" />
      <div className="background-content">{children}</div>
    </div>
  );
};

export default Background;
