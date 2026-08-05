import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  FaSignOutAlt,
  FaHeadset,
  FaHeart,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaGift,
} from "react-icons/fa";
import { useUserAuth } from "../../context/UserAuthContext";
import { useAdminLayout } from "../../context/AdminLayoutContext";
import AdminButton from "../admin-ui/AdminButton";
import { fetchNotificationCount, fetchAdminSupportStats } from "../../services/adminApiService";

const LIT_LOGO = "/lit-logo.svg";

const NAV_ITEMS = [
  { to: "/admin/ecomDashboard", end: true, icon: FaTachometerAlt, label: "Dashboard" },
  { to: "products", icon: FaBoxOpen, label: "Products" },
  { to: "categories", icon: FaTags, label: "Categories" },
  { to: "inventory", icon: FaWarehouse, label: "Inventory" },
  { to: "orders", icon: FaShoppingCart, label: "Orders" },
  { to: "gift-cards", icon: FaGift, label: "Gift Cards" },
  { to: "carts", icon: FaShoppingCart, label: "Carts" },
  { to: "notifications", icon: FaBell, label: "Notifications", showBadge: true },
  { to: "support", icon: FaHeadset, label: "Support", showSupportBadge: true },
  { to: "wishlists", icon: FaHeart, label: "Wishlists" },
  { to: "wishlist-items", icon: FaHeart, label: "Wishlist Items" },
  { to: "marketplace", icon: FaTags, label: "Marketplace" },
  { to: "customers", icon: FaUsers, label: "Customers" },
  { to: "analytics", icon: FaChartLine, label: "Analytics" },
  { to: "offers", icon: FaTags, label: "Offers" },
  { to: "sales", icon: FaDollarSign, label: "Sales" },
  { to: "newsletter", icon: FaEnvelope, label: "Newsletter" },
  { to: "settings", icon: FaCog, label: "Settings" },
];

function getInitials(name, email) {
  const source = name || email || "A";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const EcomSidebar = () => {
  const { logout, displayName, displayEmail } = useUserAuth();
  const { sidebarCollapsed, toggleSidebar } = useAdminLayout();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [openSupportCount, setOpenSupportCount] = useState(0);

  const refreshUnreadCount = () => {
    fetchNotificationCount()
      .then((data) => setUnreadCount(data.unreadCount ?? 0))
      .catch(() => setUnreadCount(0));

    fetchAdminSupportStats()
      .then((data) => setOpenSupportCount(data.unreadMessages ?? data.waitingForAdmin ?? 0))
      .catch(() => setOpenSupportCount(0));
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [location.pathname]);

  return (
    <aside className="adm-sidebar ecom-sidebar fixed inset-y-0 left-0 z-[1000] flex h-dvh w-[var(--sidebar-width,var(--adm-sidebar-width))] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-r border-[var(--adm-border-accent)] bg-[var(--adm-glass-strong)] p-4 shadow-[var(--adm-shadow-md)] backdrop-blur-xl transition-[width,transform] duration-300 max-md:w-[var(--adm-sidebar-expanded)] max-md:-translate-x-full [.adm-layout--mobile-open_&]:max-md:translate-x-0" aria-label="Admin navigation">
      <div className="adm-sidebar__brand mb-3 flex min-h-14 shrink-0 items-center gap-3 p-3">
        <div className="adm-sidebar__logo grid size-11 shrink-0 place-items-center overflow-hidden rounded-[var(--adm-radius-md)] border border-purple-600/20 bg-gradient-to-br from-purple-600/20 to-[#d4af37]/10">
          <img src={LIT_LOGO} alt="LIT" className="adm-sidebar__logo-img block size-[30px] object-contain" />
        </div>
        {!sidebarCollapsed && (
          <div className="adm-sidebar__brand-text min-w-0 overflow-hidden whitespace-nowrap">
            <p className="adm-sidebar__brand-title">LIT Admin</p>
            <p className="adm-sidebar__brand-sub">Marketplace</p>
          </div>
        )}
      </div>

      <nav className="adm-sidebar__nav flex min-h-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto pr-1">
        {NAV_ITEMS.map(({ to, end, icon: Icon, label, showBadge, showSupportBadge }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `adm-sidebar__link relative flex min-w-0 items-center gap-3 rounded-[var(--adm-radius-md)] border border-transparent px-3.5 py-[11px] text-[0.92rem] font-medium text-[var(--adm-text-muted)] no-underline transition hover:translate-x-0.5 hover:bg-purple-600/10 hover:text-[var(--adm-text)] [&>svg]:size-[18px] [&>svg]:shrink-0 [&>span]:min-w-0 [&>span]:truncate ${isActive ? "active border-[var(--adm-border-accent)] bg-purple-600/20 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]" : ""}`
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
            {showBadge && unreadCount > 0 && (
              <span className="adm-sidebar__link-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
            {showSupportBadge && openSupportCount > 0 && (
              <span className="adm-sidebar__link-badge">{openSupportCount > 99 ? "99+" : openSupportCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="adm-sidebar__footer mt-auto flex shrink-0 flex-col gap-3 border-t border-[var(--adm-border)] pt-4">
        <div className="adm-sidebar__profile flex min-w-0 items-center gap-3 rounded-[var(--adm-radius-md)] border border-[var(--adm-border)] bg-white/[0.03] p-3">
          <div className="adm-sidebar__avatar grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#9333ea] to-[#d4af37] text-[0.85rem] font-semibold text-white" aria-hidden="true">
            {getInitials(displayName, displayEmail)}
          </div>
          {!sidebarCollapsed && (
            <div className="adm-sidebar__profile-text min-w-0 flex-1 overflow-hidden">
              <p className="adm-sidebar__profile-name">{displayName || "Admin"}</p>
              <p className="adm-sidebar__profile-email">{displayEmail}</p>
            </div>
          )}
        </div>

        <div className="adm-sidebar__footer-actions flex items-center justify-between gap-2">
          <AdminButton
            variant="ghost"
            size="sm"
            icon={<FaSignOutAlt />}
            onClick={logout}
            className="adm-sidebar__logout"
          >
            {!sidebarCollapsed && "Sign out"}
          </AdminButton>
          <button
            type="button"
            className="adm-sidebar__collapse grid size-9 shrink-0 place-items-center rounded-[var(--adm-radius-md)] border border-[var(--adm-border)] bg-white/[0.04] text-[var(--adm-text-muted)] transition hover:border-[var(--adm-border-accent)] hover:bg-purple-600/10 hover:text-[var(--adm-text)] max-md:hidden"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default EcomSidebar;
