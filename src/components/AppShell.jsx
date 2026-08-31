import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import "./AppShell.css";

const roleLabels = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};

function AppShell({ children }) {
  const { user, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const role =
    user?.role || "STUDENT";

  const roleLabel =
    roleLabels[role] || role;

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const navigation = [
    {
      label: "Dashboard",
      icon: "⌂",
      roles: [
        "STUDENT",
        "TEACHER",
        "ADMIN",
        "SUPER_ADMIN",
      ],
      path: "/dashboard",
    },

    {
      label: "Courses",
      icon: "▣",
      roles: [
        "STUDENT",
        "TEACHER",
      ],
      path: "/courses",
    },

    {
      label: "Examinations",
      icon: "✓",
      roles: [
        "STUDENT",
        "TEACHER",
      ],
      path: "/examinations",
    },

        {
      label: "Mock Tests",
      icon: "◈",
      roles: [
        "STUDENT",
      ],
      path: "/mock-tests",
    },

    {
      label: "Results",
      icon: "▥",
      roles: [
        "STUDENT",
        "TEACHER",
      ],
      path: "/results",
    },

    {
      label: "Users",
      icon: "◉",
      roles: [
        "ADMIN",
        "SUPER_ADMIN",
      ],
      path: "/admin/users",
    },

    {
      label: "Administration",
      icon: "⚙",
      roles: [
        "SUPER_ADMIN",
      ],
      path: "/admin",
    },
  ];

  const visibleNavigation =
    navigation.filter((item) =>
      item.roles.includes(role)
    );

  /*
   * ============================================================
   * CURRENT PATH
   * ============================================================
   */

  const currentPath =
    window.location.pathname;

  /*
   * ============================================================
   * NAVIGATION HANDLER
   * ============================================================
   */

  const navigate = (path) => {
    if (!path) {
      return;
    }

    setSidebarOpen(false);

    window.location.href =
      path;
  };

  /*
   * ============================================================
   * ACTIVE NAVIGATION
   * ============================================================
   */

  const isNavigationActive =
    (item) => {
      if (
        item.label ===
        "Dashboard"
      ) {
        return (
          currentPath ===
            "/" ||
          currentPath ===
            "/dashboard"
        );
      }

      if (
        item.label ===
        "Courses"
      ) {
        return (
          currentPath ===
            "/courses" ||
          currentPath.startsWith(
            "/course/"
          )
        );
      }

      return (
        currentPath ===
        item.path
      );
    };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="application">

      {/* ======================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        {/* ----------------------------------------------------
            BRAND
        ---------------------------------------------------- */}

        <div className="sidebar-brand">

          <div className="brand-mark">
            OJ
          </div>

          <div>
            <strong>
              OJDV
            </strong>

            <span>
              Education
            </span>
          </div>

        </div>

        {/* ----------------------------------------------------
            NAVIGATION
        ---------------------------------------------------- */}

        <nav className="sidebar-nav">

          <p className="nav-label">
            Workspace
          </p>

          {visibleNavigation.map(
            (item) => {

              const isActive =
                isNavigationActive(
                  item
                );

              return (
                <button
                  type="button"
                  className={`nav-item ${
                    isActive
                      ? "active"
                      : ""
                  }`}
                  key={
                    item.label
                  }
                  onClick={() =>
                    navigate(
                      item.path
                    )
                  }
                >

                  <span className="nav-icon">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>

                </button>
              );
            }
          )}

        </nav>

        {/* ----------------------------------------------------
            SIDEBAR FOOTER
        ---------------------------------------------------- */}

        <div className="sidebar-footer">

          <div className="security-note">

            <span>
              ●
            </span>

            Secure session

          </div>

        </div>

      </aside>

      {/* ======================================================
          APPLICATION CONTENT
      ====================================================== */}

      <div className="application-content">

        {/* ----------------------------------------------------
            TOPBAR
        ---------------------------------------------------- */}

        <header className="topbar">

          {/* Mobile menu */}

          <button
            type="button"
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          {/* Application title */}

          <div className="topbar-title">

            <span>
              OJDV Education
            </span>

            <strong>
              Learning Management Platform
            </strong>

          </div>

          {/* User */}

          <div className="topbar-user">

            <div className="user-details">

              <strong>
                {user?.name ||
                  "User"}
              </strong>

              <span>
                {roleLabel}
              </span>

            </div>

            <div className="user-avatar">

              {(user?.name ||
                "U")
                .trim()
                .charAt(0)
                .toUpperCase()}

            </div>

            <button
              type="button"
              className="logout-button"
              onClick={signOut}
            >
              Logout
            </button>

          </div>

        </header>

        {/* ----------------------------------------------------
            MAIN CONTENT
        ---------------------------------------------------- */}

        <main className="main-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AppShell;



