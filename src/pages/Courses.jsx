import { useEffect, useState } from "react";

import "./Courses.css";

const API_BASE_URL = "/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/courses`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load courses."
        );
      }

      setCourses(
        Array.isArray(data.courses)
          ? data.courses
          : []
      );
    } catch (err) {
      console.error(
        "Courses load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  }

  function openCourse(courseId) {
    if (!courseId) {
      return;
    }

    window.location.href =
      `/course/${courseId}`;
  }

  function goToDashboard() {
    window.location.href =
      "/dashboard";
  }

  /*
   * ============================================================
   * SAFE COURSE DATA HELPERS
   * ============================================================
   *
   * The backend may return different data types for some fields.
   * These helpers make sure React only receives renderable values.
   */

  function getCourseImage(course) {
    const image =
      course?.imageUrl ||
      course?.imageURL ||
      course?.thumbnail ||
      course?.image ||
      "";

    return typeof image === "string"
      ? image
      : "";
  }

  function getCourseTitle(course) {
    const title =
      course?.title ||
      course?.name ||
      "Untitled Course";

    return typeof title === "string"
      ? title
      : "Untitled Course";
  }

  function getCourseDescription(course) {
    const description =
      course?.description ||
      "Explore this course and continue your learning journey.";

    return typeof description === "string"
      ? description
      : "Explore this course and continue your learning journey.";
  }

  function getCourseCategory(course) {
    const category =
      course?.category ||
      course?.type ||
      "EDUCATION";

    return typeof category === "string"
      ? category
      : "EDUCATION";
  }

  function getCourseLevel(course) {
    const level =
      course?.level ||
      course?.difficulty ||
      "All Levels";

    return typeof level === "string"
      ? level
      : "All Levels";
  }

  function getCourseDuration(course) {
    const duration =
      course?.duration ||
      course?.durationText ||
      "Self paced";

    if (
      typeof duration === "string" ||
      typeof duration === "number"
    ) {
      return String(duration);
    }

    return "Self paced";
  }

  /*
   * ============================================================
   * FACULTY
   * ============================================================
   *
   * IMPORTANT:
   * Backend currently returns faculty as an object like:
   *
   * {
   *   _id,
   *   designation,
   *   experience,
   *   name,
   *   photoUrl,
   *   subject
   * }
   *
   * React cannot render the object directly.
   *
   * We therefore extract the most useful display value.
   */

  function getCourseFaculty(course) {
    const faculty =
      course?.faculty ||
      course?.instructor ||
      course?.teacher;

    if (!faculty) {
      return "OJDV Education";
    }

    if (typeof faculty === "string") {
      return faculty;
    }

    if (
      typeof faculty === "number"
    ) {
      return String(faculty);
    }

    if (
      typeof faculty === "object"
    ) {
      return (
        faculty.name ||
        faculty.subject ||
        faculty.designation ||
        "OJDV Education"
      );
    }

    return "OJDV Education";
  }

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <main className="courses-page">
        <div className="courses-shell">
          <div className="courses-loading">

            <div className="courses-loading-mark">
              <span />
            </div>

            <p className="courses-loading-label">
              OJDV EDUCATION
            </p>

            <h1>
              Preparing your courses
            </h1>

            <p>
              Loading your learning catalogue...
            </p>

          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR STATE
   * ============================================================
   */

  if (error) {
    return (
      <main className="courses-page">

        <div className="courses-shell">

          <section className="courses-error">

            <div className="courses-error-icon">
              !
            </div>

            <p className="courses-section-label">
              COURSE LIBRARY
            </p>

            <h1>
              Unable to load courses
            </h1>

            <p>
              {error}
            </p>

            <div className="courses-error-actions">

              <button
                type="button"
                className="courses-primary-button"
                onClick={loadCourses}
              >
                Try Again
              </button>

              <button
                type="button"
                className="courses-secondary-button"
                onClick={goToDashboard}
              >
                Back to Dashboard
              </button>

            </div>

          </section>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * MAIN COURSES PAGE
   * ============================================================
   */

  return (
    <main className="courses-page">

      <div className="courses-shell">

        {/* ======================================================
            BACK NAVIGATION
        ====================================================== */}

        <button
          type="button"
          className="courses-back-button"
          onClick={goToDashboard}
        >
          <span className="courses-back-arrow">
            ←
          </span>

          <span>
            Back to Dashboard
          </span>
        </button>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="courses-hero">

          <div className="courses-hero-content">

            <div className="courses-kicker">
              <span className="courses-kicker-dot" />
              OJDV EDUCATION
            </div>

            <h1>
              Learn with
              <br />
              purpose.
            </h1>

            <p>
              Explore structured courses designed
              to help you understand concepts,
              build confidence and progress
              consistently.
            </p>

            <div className="courses-stats">

              <div className="courses-stat">
                <strong>
                  {courses.length}
                </strong>

                <span>
                  Available Courses
                </span>
              </div>

              <div className="courses-stat">
                <strong>
                  24/7
                </strong>

                <span>
                  Learn at your pace
                </span>
              </div>

              <div className="courses-stat">
                <strong>
                  OJDV
                </strong>

                <span>
                  Guided learning
                </span>
              </div>

            </div>

          </div>

          <div className="courses-hero-decoration">

            <div className="courses-orbit courses-orbit-one" />
            <div className="courses-orbit courses-orbit-two" />
            <div className="courses-orbit courses-orbit-three" />

            <div className="courses-hero-core">
              <span>
                OJ
              </span>
            </div>

          </div>

        </section>

        {/* ======================================================
            COURSE LIBRARY HEADER
        ====================================================== */}

        <section className="courses-library-header">

          <div>

            <p className="courses-section-label">
              YOUR LEARNING LIBRARY
            </p>

            <h2>
              Explore Courses
            </h2>

            <p className="courses-library-description">
              Choose a course and continue your
              learning journey.
            </p>

          </div>

          <div className="courses-count">

            <span>
              {String(
                courses.length
              ).padStart(2, "0")}
            </span>

            <small>
              COURSES
            </small>

          </div>

        </section>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {courses.length === 0 ? (

          <section className="courses-empty">

            <div className="courses-empty-icon">
              +
            </div>

            <h2>
              No courses available
            </h2>

            <p>
              There are currently no published
              courses in the learning catalogue.
            </p>

            <button
              type="button"
              className="courses-primary-button"
              onClick={loadCourses}
            >
              Refresh Courses
            </button>

          </section>

        ) : (

          /* ====================================================
             COURSE GRID
          ==================================================== */

          <section className="courses-grid">

            {courses.map(
              (course, index) => {

                const courseId =
                  course?._id ||
                  course?.id;

                const image =
                  getCourseImage(course);

                const title =
                  getCourseTitle(course);

                const description =
                  getCourseDescription(course);

                const category =
                  getCourseCategory(course);

                const level =
                  getCourseLevel(course);

                const duration =
                  getCourseDuration(course);

                const faculty =
                  getCourseFaculty(course);

                return (
                  <article
                    className="course-card"
                    key={
                      courseId ||
                      `${title}-${index}`
                    }
                  >

                    {/* ==================================================
                        CARD NUMBER
                    ================================================== */}

                    <div className="course-card-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    {/* ==================================================
                        IMAGE / VISUAL
                    ================================================== */}

                    <div className="course-card-visual">

                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";

                            const fallback =
                              event.currentTarget
                                .parentElement
                                ?.querySelector(
                                  ".course-card-visual-fallback"
                                );

                            if (fallback) {
                              fallback.style.display =
                                "flex";
                            }
                          }}
                        />
                      ) : null}

                      <div
                        className="course-card-visual-fallback"
                        style={{
                          display: image
                            ? "none"
                            : "flex",
                        }}
                      >
                        <span>
                          {title
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>

                      <div className="course-card-overlay" />

                      <span className="course-card-category">
                        {category}
                      </span>

                    </div>

                    {/* ==================================================
                        CONTENT
                    ================================================== */}

                    <div className="course-card-content">

                      <div className="course-card-meta">

                        <span>
                          {level}
                        </span>

                        <span className="course-card-meta-dot">
                          •
                        </span>

                        <span>
                          {duration}
                        </span>

                      </div>

                      <h3>
                        {title}
                      </h3>

                      <p>
                        {description}
                      </p>

                      {/* ==================================================
                          CARD FOOTER
                      ================================================== */}

                      <div className="course-card-footer">

                        <div className="course-card-faculty">

                          <span className="faculty-dot" />

                          <span>
                            {faculty}
                          </span>

                        </div>

                        <button
                          type="button"
                          className="course-view-button"
                          onClick={() =>
                            openCourse(
                              courseId
                            )
                          }
                          disabled={!courseId}
                        >

                          <span>
                            View Course
                          </span>

                          <span className="course-view-arrow">
                            →
                          </span>

                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="courses-footer">

          <div>

            <strong>
              OJDV EDUCATION
            </strong>

            <span>
              Keep learning. Keep moving forward.
            </span>

          </div>

          <span>
            © {new Date().getFullYear()} OJDV
          </span>

        </footer>

      </div>

    </main>
  );
}

export default Courses;