import React from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/context-admin/AuthContext";

import { FaSignOutAlt, FaArrowLeft, FaColumns } from "react-icons/fa";
import adminBackground from "../../img/body-bg.png";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const showBackButton = location.pathname !== "/admin/dashboard";

  const isDashboard =
    location.pathname === "/admin/dashboard" ||
    location.pathname === "/admin/ecomDashboard";

  const panelType = sessionStorage.getItem("adminPanelType");
  const dashboardPath =
    panelType === "ecom" ? "/admin/ecomDashboard" : "/admin/dashboard";

  return (
    <div
      className="relative min-h-screen w-full max-w-full bg-cover bg-center bg-fixed p-8 transition-[padding] duration-300 max-md:px-4 max-md:py-6"
      style={{ backgroundImage: `url(${adminBackground})` }}
    >
      <header className="mx-auto mb-8 flex w-full max-w-[1400px] items-center justify-between gap-4 max-md:mb-6">
        <div className="flex min-w-0 items-center gap-4">
          {/* Show Back button if not on dashboard */}
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 shrink-0 items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/10 px-[1.4rem] text-sm font-semibold text-gray-300 transition hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] max-md:px-4 max-md:text-[0.85rem] max-[480px]:w-11 max-[480px]:gap-0 max-[480px]:p-0 [&>span]:max-[480px]:hidden"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
          )}
          {/* Show Dashboard link if not on dashboard */}
          {!isDashboard && (
            <Link to={dashboardPath} className="flex h-11 shrink-0 items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/10 px-[1.4rem] text-sm font-semibold text-gray-300 no-underline transition hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] max-md:px-4 max-md:text-[0.85rem] max-[480px]:w-11 max-[480px]:gap-0 max-[480px]:p-0 [&>span]:max-[480px]:hidden">
              <FaColumns />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        {/* <button onClick={logout} className="header-btn logout-btn">
                    <span>Logout</span>
                    <FaSignOutAlt />
                </button> */}

        {/* <button
  onClick={() => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('currentUser');

    if (location.pathname.startsWith('/admin/ecomDashboard')) {
      window.location.href = '/shop'; // Still use full reload for external
    } else {
      navigate('/newsletter'); // ✅ Smooth client-side redirect
    }
  }}
  className="header-btn logout-btn"
>
  <span>Logout</span>
  <FaSignOutAlt />
</button> */}

        <button
          onClick={() => {
            if (location.pathname.startsWith("/admin/ecomDashboard")) {
              logout("/shop", navigate); // ✅ Go to shop
            } else {
              logout("/newsletter", navigate); // ✅ Go to newsletter
            }
          }}
          className="flex h-11 shrink-0 items-center justify-center gap-3 rounded-lg border border-red-500/40 bg-red-500/15 px-[1.4rem] text-sm font-semibold text-red-400 transition hover:-translate-y-0.5 hover:bg-red-500/25 hover:text-red-500 hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)] max-md:px-4 max-md:text-[0.85rem] max-[480px]:w-11 max-[480px]:gap-0 max-[480px]:p-0 [&>span]:max-[480px]:hidden"
        >
          <span>Logout</span>
          <FaSignOutAlt />
        </button>
      </header>
      <main className="w-full min-w-0 max-w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
