import { useEffect, useState } from "react";

import AdminLayout from "./AdminLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";

const API_BASE_URL = import.meta.env.PROD
  ? "https://ojd-version.onrender.com/api"
  : "http://127.0.0.1:5000/api";

const emptyStats = {
  students: {
    total: 0,
    active: 0,
  },
  courses: {
    total: 0,
    published: 0,
  },
  faculty: {
    total: 0,
    published: 0,
  },
  mockTests: {
    total: 0,
    published: 0,
  },
  modules: {
    total: 0,
    published: 0,
  },
  lessons: {
    total: 0,
    published: 0,
  },
  activity: [],
};

const activityLabels = {
  COURSE: "Course",
  FACULTY: "Faculty",
  MOCK_TEST: "Mock Test",
  MODULE: "Module",
  LESSON: "Lesson",
};

const formatActivityDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function AdminDashboard() {
  const { token } = useAuth();

  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load administrator statistics."
        );
      }

      setStats({
        ...emptyStats,
        ...(data.stats || {}),
      });
    } catch (err) {
      console.error("Admin statistics load error:", err);

      setError(
        err.message ||
          "Unable to load administrator statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  const statCards = [
    {
      label: "Total Students",
      value: stats.students.total,
      change: `${stats.students.active} active`,
      icon: "♙",
    },
    {
      label: "Courses",
      value: stats.courses.total,
      change: `${stats.courses.published} published`,
      icon: "▤",
    },
    {
      label: "Faculty",
      value: stats.faculty.total,
      change: `${stats.faculty.published} published`,
      icon: "◉",
    },
    {
      label: "Mock Tests",
      value: stats.mockTests.total,
      change: `${stats.mockTests.published} published`,
      icon: "✓",
    },
    {
      label: "Course Modules",
      value: stats.modules.total,
      change: `${stats.modules.published} published`,
      icon: "▥",
    },
    {
      label: "Course Lessons",
      value: stats.lessons.total,
      change: `${stats.lessons.published} published`,
      icon: "▧",
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

      {error && (
        <section className="admin-panel">
          <div className="admin-empty-state">
            <strong>
              Unable to load dashboard statistics
            </strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadStats}
            >
              Try again
            </button>
          </div>
        </section>
      )}

      <section className="admin-stats-grid">
        {statCards.map((stat) => (
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
              {loading ? "—" : stat.value}
            </strong>

            <span className="admin-stat-change">
              {loading
                ? "Loading..."
                : stat.change}
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

          {loading ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">
                ◌
              </div>

              <strong>
                Loading activity
              </strong>

              <p>
                Fetching the latest platform changes.
              </p>
            </div>
          ) : stats.activity.length === 0 ? (
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
          ) : (
            <div className="admin-activity-list">
              {stats.activity.map((item, index) => (
                <div
                  className="admin-activity-item"
                  key={`${item.type}-${item.date}-${index}`}
                >
                  <div className="admin-activity-icon">
                    {item.type === "COURSE"
                      ? "▤"
                      : item.type === "FACULTY"
                        ? "◉"
                        : item.type === "MOCK_TEST"
                          ? "✓"
                          : item.type === "MODULE"
                            ? "▥"
                            : "▧"}
                  </div>

                  <div className="admin-activity-content">
                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {activityLabels[item.type] ||
                        "Platform update"}
                    </span>
                  </div>

                  <time>
                    {formatActivityDate(item.date)}
                  </time>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
