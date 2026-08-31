import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import "./Dashboard.css";

const API_BASE_URL = "/api";

const roleLabels = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};

const UPSC_COURSE_ID = "6a93da49f47a7aa6552ec9ae";

function Dashboard() {
  const { user, token } = useAuth();

  const role = user?.role || "STUDENT";
  const roleLabel = roleLabels[role] || role;

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(
    role === "STUDENT"
  );

  const openCourses = () => {
    window.location.href = `/course/${UPSC_COURSE_ID}`;
  };

  const openMockTests = () => {
    window.location.href = "/mock-tests";
  };

  const openResume = () => {
    const lastLesson = progress?.lastLesson;

    if (
      lastLesson &&
      typeof lastLesson === "object" &&
      lastLesson._id
    ) {
      const moduleId =
        lastLesson.module?._id ||
        lastLesson.module ||
        "";

      if (moduleId) {
        window.location.href =
          `/course/${UPSC_COURSE_ID}/lesson/${moduleId}/${lastLesson._id}`;

        return;
      }
    }

    openCourses();
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      /*
       * Only STUDENT accounts are authorized to access
       * the student course-progress endpoint.
       *
       * ADMIN / TEACHER / SUPER_ADMIN should not make
       * a request that will intentionally return 403.
       */
      if (
        role !== "STUDENT" ||
        !token
      ) {
        setProgress(null);
        setProgressLoading(false);
        return;
      }

      try {
        setProgressLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/course-progress/course/${UPSC_COURSE_ID}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load learning progress."
          );
        }

        if (!cancelled) {
          setProgress(data.progress || null);
        }
      } catch (error) {
        console.error(
          "Dashboard progress load error:",
          error
        );

        if (!cancelled) {
          /*
           * Progress is supplementary dashboard information.
           * A failure must never prevent the dashboard itself
           * from rendering.
           */
          setProgress(null);
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [token, role]);

  const progressPercentage = Math.min(
    100,
    Math.max(
      0,
      Number(
        progress?.progressPercentage || 0
      )
    )
  );

  const completedLessons = Number(
    progress?.completedLessons || 0
  );

  const totalLessons = Number(
    progress?.totalLessons || 0
  );

  const lastLessonTitle =
    progress?.lastLesson?.title || "";

  const hasLastLesson =
    Boolean(progress?.lastLesson);

  const progressStyle = {
    "--progress": `${progressPercentage * 3.6}`,
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            OJDV Education
          </p>

          <h1>
            Welcome back
            {user?.name
              ? `, ${user.name}`
              : ""}
          </h1>

          <p className="dashboard-description">
            Here is your education workspace
            overview.
          </p>
        </div>

        <div className="role-badge">
          {roleLabel}
        </div>
      </div>

      {role === "STUDENT" && (
        <section className="dashboard-resume-card">
          <div className="dashboard-resume-content">
            <div className="dashboard-resume-kicker">
              YOUR LEARNING
            </div>

            <h2>
              {hasLastLesson
                ? "Continue where you left off"
                : "Start your OJDV learning journey"}
            </h2>

            <p>
              {hasLastLesson
                ? lastLessonTitle
                : "Begin the UPSC Civil Services course and build your preparation step by step."}
            </p>

            <div className="dashboard-progress-meta">
              <span>
                {completedLessons} of{" "}
                {totalLessons || "—"} lessons
              </span>

              <strong>
                {progressLoading
                  ? "Loading..."
                  : `${Math.round(
                      progressPercentage
                    )}% complete`}
              </strong>
            </div>

            <div
              className="dashboard-progress-track"
              aria-label={`Course progress ${Math.round(
                progressPercentage
              )}%`}
            >
              <span
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            <button
              type="button"
              className="dashboard-resume-button"
              onClick={openResume}
              disabled={progressLoading}
            >
              {progressLoading
                ? "Loading progress..."
                : hasLastLesson
                  ? "Resume Learning →"
                  : "Begin Learning →"}
            </button>
          </div>

          <div
            className="dashboard-resume-visual"
            style={progressStyle}
            aria-hidden="true"
          >
            <span className="dashboard-resume-ring">
              <strong>
                {Math.round(
                  progressPercentage
                )}%
              </strong>
            </span>
          </div>
        </section>
      )}

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
          <div className="card-icon">
            📚
          </div>

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
          <div className="card-icon">
            📝
          </div>

          <h2>Examinations</h2>

          <p>
            View available examinations and
            track your attempts.
          </p>

          <span className="card-status">
            Coming next
          </span>
        </article>

        <article
          className="dashboard-card dashboard-card-clickable dashboard-mock-tests-card"
          onClick={openMockTests}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              openMockTests();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open Mock Tests"
        >
          <div className="card-icon">
            ◈
          </div>

          <h2>Mock Tests</h2>

          <p>
            Practice exam-style questions,
            improve your score, and track your
            preparation with real attempts.
          </p>

          <span className="card-status">
            Explore Mock Tests →
          </span>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">
            📊
          </div>

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
          <div className="card-icon">
            🔔
          </div>

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



