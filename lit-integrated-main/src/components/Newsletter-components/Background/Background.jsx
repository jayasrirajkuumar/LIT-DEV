import React from "react";
import landingPageBg from "../../assets/landing-page-bg.png";
import "./Background.css";

const Background = ({ children }) => {
  return (
    <div className="background-container">
      <div
        className="background-image"
        style={{ backgroundImage: `url(${landingPageBg})` }}
      />
      <div className="background-overlay"></div>
      <div className="background-content">{children}</div>
    </div>
  );
};

export default Background;
