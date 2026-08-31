import { useAuth } from "../auth/AuthContext.jsx";
import "./Dashboard.css";

const roleLabels = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};

const UPSC_COURSE_ID = "6a93da49f47a7aa6552ec9ae";

function Dashboard() {
  const { user } = useAuth();

  const role = user?.role || "STUDENT";
  const roleLabel = roleLabels[role] || role;

  const openCourses = () => {
    window.location.href = `/course/${UPSC_COURSE_ID}`;
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">OJDV Education</p>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="dashboard-description">
            Here is your education workspace overview.
          </p>
        </div>

        <div className="role-badge">
          {roleLabel}
        </div>
      </div>

      <div className="dashboard-grid">
        <article
          className="dashboard-card dashboard-card-clickable"
          onClick={openCourses}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              openCourses();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open My Courses"
        >
          <div className="card-icon">📚</div>

          <h2>My Courses</h2>

          <p>
            Access your enrolled courses and
            learning material.
          </p>

          <span className="card-status">
            Explore Courses →
          </span>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">📝</div>

          <h2>Examinations</h2>

          <p>
            View available examinations and
            track your attempts.
          </p>

          <span className="card-status">
            Coming next
          </span>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">📊</div>

          <h2>Performance</h2>

          <p>
            Monitor results, progress, and
            academic performance.
          </p>

          <span className="card-status">
            Coming next
          </span>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">🔔</div>

          <h2>Notifications</h2>

          <p>
            Stay updated with important OJDV
            announcements.
          </p>

          <span className="card-status">
            Coming next
          </span>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;

