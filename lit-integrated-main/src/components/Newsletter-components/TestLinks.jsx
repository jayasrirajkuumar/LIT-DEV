import React from "react";
import { Link } from "react-router-dom";

const TestLinks = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "100px",
        left: "20px",
        padding: "20px",
        background: "white",
        zIndex: 9999,
        border: "2px solid red",
      }}
    >
      <h2 style={{ color: "black" }}>TESTING LINKS</h2>
      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Link to="/" style={{ color: "blue", fontSize: "24px" }}>
          Go to Home (/)
        </Link>
        <Link
          to="/article/test-slug"
          style={{ color: "blue", fontSize: "24px" }}
        >
          Go to Article Page
        </Link>
      </nav>
    </div>
  );
};

export default TestLinks;
