import React, { createContext, useContext, useMemo, useState } from "react";

const AdminLayoutContext = createContext(null);

export function AdminLayoutProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((prev) => !prev),
      mobileSidebarOpen,
      setMobileSidebarOpen,
    }),
    [sidebarCollapsed, mobileSidebarOpen],
  );

  return (
    <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  }
  return context;
}

export default AdminLayoutContext;
