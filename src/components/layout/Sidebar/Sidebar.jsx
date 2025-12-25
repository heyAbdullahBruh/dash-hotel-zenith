import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faUtensils,
  faShoppingCart,
  faCalendar,
  faTags,
  faUsers,
  faStar,
  faCog,
  faChevronLeft,
  faChevronRight,
  faBars,
  faHotel,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

const menuItems = [
  { path: "/dashboard", icon: faDashboard, label: "Dashboard" },
  { path: "/foods", icon: faUtensils, label: "Food Management" },
  { path: "/orders", icon: faShoppingCart, label: "Order Management" },
  { path: "/bookings/table", icon: faCalendar, label: "Table Bookings" },
  { path: "/bookings/event", icon: faCalendar, label: "Event Bookings" },
  { path: "/categories", icon: faTags, label: "Categories" },
  { path: "/reviews", icon: faStar, label: "Reviews" },
  { path: "/admins", icon: faUsers, label: "Admin Management" },
  { path: "/settings", icon: faCog, label: "Settings" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSuperAdmin } = useAuth();
  const location = useLocation();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === "/admins" && !isSuperAdmin) return false;
    return true;
  });

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarClasses = clsx(styles.sidebar, {
    [styles.collapsed]: collapsed,
    [styles.mobileOpen]: mobileOpen,
  });

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile toggle button */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <aside className={sidebarClasses}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <FontAwesomeIcon icon={faHotel} />
            {!collapsed && <span>HotelZenith</span>}
          </div>

          <button
            className={styles.collapseButton}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FontAwesomeIcon
              icon={collapsed ? faChevronRight : faChevronLeft}
            />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(styles.menuItem, {
                      [styles.active]: isActive,
                    })
                  }
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={styles.menuIcon}
                  />
                  {!collapsed && (
                    <span className={styles.menuLabel}>{item.label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className={styles.userDetails}>
                <p className={styles.userName}>Admin User</p>
                <p className={styles.userRole}>Administrator</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
