// src/components/MainLayout/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";

// This component is now just a structural layout.
// All flip logic has been moved to NewsletterPage for efficiency.
const MainLayout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default MainLayout;
