import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import EcomSidebar from "../../components/EcommerceAdmin/EcomSidebar";
import { AdminLayoutProvider, useAdminLayout } from "../../context/AdminLayoutContext";
import {
  FaTachometerAlt,
  FaChartLine,
  FaBoxOpen,
  FaTags,
  FaWarehouse,
  FaShoppingCart,
  FaDollarSign,
  FaUsers,
  FaEnvelope,
  FaCog,
} from "react-icons/fa";
import AdminButton from "../../components/admin-ui/AdminButton";
import "../../styles/admin-design-system.css";

const pageDetails = {
  ecomDashboard: { title: "Dashboard", icon: FaTachometerAlt },
  analytics: { title: "Analytics", icon: FaChartLine },
  products: { title: "Products", icon: FaBoxOpen },
  categories: { title: "Categories", icon: FaTags },
  offers: { title: "Offers", icon: FaTags },
  inventory: { title: "Inventory", icon: FaWarehouse },
  orders: { title: "Orders", icon: FaShoppingCart },
  sales: { title: "Sales", icon: FaDollarSign },
  customers: { title: "Customers", icon: FaUsers },
  newsletter: { title: "Newsletter", icon: FaEnvelope },
  settings: { title: "Settings", icon: FaCog },
  add: { title: "Add Product", icon: FaBoxOpen },
  edit: { title: "Edit Product", icon: FaBoxOpen },
};

function EcomAdminDashboardShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useAdminLayout();
  const [currentPage, setCurrentPage] = useState(pageDetails.ecomDashboard);

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const key = segments[segments.length - 1];
    setCurrentPage(pageDetails[key] || pageDetails.ecomDashboard);
    setMobileSidebarOpen(false);
  }, [location, setMobileSidebarOpen]);

  const isDetailPage =
    location.pathname.includes("/products/") &&
    location.pathname.split("/").length > 4;

  const PageIcon = currentPage.icon;

  return (
    <div
      className={[
        "ecom-admin-layout min-h-screen max-w-full overflow-x-clip bg-[var(--lit-bg,#08080c)]",
        sidebarCollapsed ? "adm-layout--collapsed" : "",
        mobileSidebarOpen ? "adm-layout--mobile-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <EcomSidebar />
      <div
        className={`adm-sidebar-overlay fixed inset-0 z-[999] bg-black/55 backdrop-blur-sm md:hidden ${mobileSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <div className="ecom-admin-content min-h-screen min-w-0 max-w-full px-8 pb-12 pt-6 transition-[margin,width] duration-300 max-md:ml-0 max-md:w-full max-md:p-4 md:ml-[var(--sidebar-width)] md:w-[calc(100%-var(--sidebar-width))]">
        <header className="adm-shell-header sticky top-0 z-40 mb-6 flex min-h-[var(--adm-header-height)] min-w-0 items-center justify-between gap-4 border-b border-[var(--adm-border)] bg-[var(--lit-bg)]/95 backdrop-blur-xl">
          <div className="adm-shell-header__title-wrap flex min-w-0 items-center gap-3">
            {isDetailPage ? (
              <AdminButton variant="outline" size="sm" onClick={() => navigate(-1)}>
                ← Back
              </AdminButton>
            ) : (
              <>
                <span className="adm-shell-header__icon" aria-hidden="true">
                  <PageIcon />
                </span>
                <h1 className="adm-shell-header__title">{currentPage.title}</h1>
              </>
            )}
          </div>
          <div className="adm-shell-header__actions flex shrink-0 items-center gap-2">
            <AdminButton
              variant="ghost"
              size="sm"
              className="adm-mobile-menu-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </AdminButton>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

const EcomAdminDashboard = () => (
  <AdminLayoutProvider>
    <EcomAdminDashboardShell />
  </AdminLayoutProvider>
);

export default EcomAdminDashboard;
