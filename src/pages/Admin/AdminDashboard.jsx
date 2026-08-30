import AdminLayout from "./AdminLayout.jsx";

function AdminDashboard() {
  const stats = [
    {
      label: "Total Students",
      value: "0",
      change: "Coming soon",
      icon: "♙",
    },
    {
      label: "Published Courses",
      value: "0",
      change: "Manage courses",
      icon: "▤",
    },
    {
      label: "Faculty",
      value: "0",
      change: "Manage faculty",
      icon: "◉",
    },
    {
      label: "Mock Tests",
      value: "0",
      change: "Manage tests",
      icon: "✓",
    },
  ];

  return (
    <AdminLayout activePage="dashboard">
      <section className="admin-welcome">
        <div>
          <span className="admin-section-kicker">
            OJDV EDUCATION
          </span>

          <h2>
            Command center
            <span>.</span>
          </h2>

          <p>
            Manage your education platform,
            courses, faculty and mock tests
            from one place.
          </p>
        </div>

        <div className="admin-welcome-badge">
          <span />
          ADMIN ACCESS
        </div>
      </section>

      <section className="admin-stats-grid">
        {stats.map((stat) => (
          <article
            className="admin-stat-card"
            key={stat.label}
          >
            <div className="admin-stat-top">
              <span className="admin-stat-label">
                {stat.label}
              </span>

              <span className="admin-stat-icon">
                {stat.icon}
              </span>
            </div>

            <strong className="admin-stat-value">
              {stat.value}
            </strong>

            <span className="admin-stat-change">
              {stat.change}
            </span>
          </article>
        ))}
      </section>

      <section className="admin-section-grid">
        <article className="admin-panel admin-quick-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-section-kicker">
                CONTENT
              </span>

              <h3>Quick management</h3>
            </div>
          </div>

          <div className="admin-quick-grid">
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/admin/courses")
              }
            >
              <span>▤</span>
              <strong>Courses</strong>
              <small>
                Create and publish courses
              </small>
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/admin/faculty")
              }
            >
              <span>◉</span>
              <strong>Faculty</strong>
              <small>
                Manage teaching faculty
              </small>
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/admin/mock-tests")
              }
            >
              <span>✓</span>
              <strong>Mock Tests</strong>
              <small>
                Manage tests and assessments
              </small>
            </button>
          </div>
        </article>

        <article className="admin-panel admin-activity-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-section-kicker">
                ACTIVITY
              </span>

              <h3>Recent activity</h3>
            </div>
          </div>

          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              ◌
            </div>

            <strong>
              No activity yet
            </strong>

            <p>
              Activity will appear here as
              your platform grows.
            </p>
          </div>
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;