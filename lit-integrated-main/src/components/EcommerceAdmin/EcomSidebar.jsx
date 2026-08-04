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
    <aside className="adm-sidebar ecom-sidebar" aria-label="Admin navigation">
      <div className="adm-sidebar__brand">
        <div className="adm-sidebar__logo">
          <img src={LIT_LOGO} alt="LIT" className="adm-sidebar__logo-img" />
        </div>
        {!sidebarCollapsed && (
          <div className="adm-sidebar__brand-text">
            <p className="adm-sidebar__brand-title">LIT Admin</p>
            <p className="adm-sidebar__brand-sub">Marketplace</p>
          </div>
        )}
      </div>

      <nav className="adm-sidebar__nav">
        {NAV_ITEMS.map(({ to, end, icon: Icon, label, showBadge, showSupportBadge }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `adm-sidebar__link${isActive ? " active" : ""}`
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

      <div className="adm-sidebar__footer">
        <div className="adm-sidebar__profile">
          <div className="adm-sidebar__avatar" aria-hidden="true">
            {getInitials(displayName, displayEmail)}
          </div>
          {!sidebarCollapsed && (
            <div className="adm-sidebar__profile-text">
              <p className="adm-sidebar__profile-name">{displayName || "Admin"}</p>
              <p className="adm-sidebar__profile-email">{displayEmail}</p>
            </div>
          )}
        </div>

        <div className="adm-sidebar__footer-actions">
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
            className="adm-sidebar__collapse"
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
