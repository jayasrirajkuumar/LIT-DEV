import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const Contact = () => {
  const { isAuthenticated } = useUserAuth();

  if (isAuthenticated) {
    return <Navigate to="/support" replace />;
  }

  return <Navigate to="/support" replace />;
};

export default Contact;
