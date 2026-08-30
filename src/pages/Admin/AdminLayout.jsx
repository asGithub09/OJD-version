import { useState } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";

import "./Admin.css";

function AdminLayout({
  children,
  activePage = "dashboard",
}) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "▦",
      path: "/admin",
    },
    {
      id: "courses",
      label: "Courses",
      icon: "▤",
      path: "/admin/courses",
    },
    {
      id: "faculty",
      label: "Faculty",
      icon: "◎",
      path: "/admin/faculty",
    },
    {
      id: "mock-tests",
      label: "Mock Tests",
      icon: "✓",
      path: "/admin/mock-tests",
    },
    {
      id: "students",
      label: "Students",
      icon: "♙",
      path: "/admin/students",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "↗",
      path: "/admin/analytics",
    },
  ];

  const handleNavigation = (path) => {
    setSidebarOpen(false);

    if (window.location.pathname === path) {
      return;
    }

    window.location.assign(path);
  };

  const handleSettings = () => {
    setSidebarOpen(false);

    if (window.location.pathname === "/admin/settings") {
      return;
    }

    window.location.assign("/admin/settings");
  };

  return (
    <div className="admin-shell">
      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-brand">
          <div className="admin-brand-logo">
            <img
              src="/images/ojd-logo.png"
              alt="OJDV"
            />
          </div>

          <div className="admin-brand-text">
            <strong>OJDV</strong>
            <span>EDUCATION</span>
          </div>
        </div>

        <div className="admin-sidebar-label">
          MANAGEMENT
        </div>

        <nav className="admin-navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item ${
                activePage === item.id
                  ? "admin-nav-item-active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation(item.path)
              }
            >
              <span className="admin-nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-label">
            SYSTEM
          </div>

          <button
            type="button"
            className="admin-nav-item"
            onClick={handleSettings}
          >
            <span className="admin-nav-icon">
              ⚙
            </span>

            <span>Settings</span>
          </button>

          <div className="admin-sidebar-watermark">
            OJDV
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-button"
              onClick={() =>
                setSidebarOpen(
                  (value) => !value
                )
              }
              aria-label="Toggle navigation"
            >
              ☰
            </button>

            <div>
              <span className="admin-topbar-kicker">
                OJDV ADMIN
              </span>

              <h1>
                {activePage === "dashboard"
                  ? "Dashboard"
                  : navigation.find(
                      (item) =>
                        item.id === activePage
                    )?.label ||
                    "Administration"}
              </h1>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-status">
              <span className="admin-status-dot" />
              System Online
            </div>

            <div className="admin-user">
              <div className="admin-user-avatar">
                {(user?.name || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="admin-user-details">
                <strong>
                  {user?.name ||
                    "Administrator"}
                </strong>

                <span>
                  {user?.role || "ADMIN"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="admin-logout"
              onClick={signOut}
              title="Sign out"
            >
              ↪
            </button>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-watermark">
            <img
              src="/images/ojd-logo.png"
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="admin-content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;