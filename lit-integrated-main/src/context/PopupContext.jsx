import React, { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  });

  const showPopup = (message, severity = "info") => {
    setPopup({
      open: true,
      message,
      severity,
    });
  };

  const hidePopup = () => {
    setPopup((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <PopupContext.Provider value={{ popup, showPopup, hidePopup }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};
