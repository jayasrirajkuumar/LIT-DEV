import React from "react";
import "./Background.css";

const Background = ({ children }) => {
  return (
    <div className="background-container">
      <div className="background-image" />
      <div className="background-content">{children}</div>
    </div>
  );
};

export default Background;
