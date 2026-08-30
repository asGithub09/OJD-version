import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/AuthContext.jsx";

import "./CourseDetails.css";

const API_BASE_URL = "/api";

function CourseDetails({ courseId }) {
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModule, setExpandedModule] = useState(null);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");

  /*
   * ============================================================
   * LOAD COURSE
   * ============================================================
   */

  useEffect(() => {
    if (!courseId) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    loadCourse();
  }, [courseId]);

  async function loadCourse() {
    try {
      setLoading(true);
      setError("");

      /*
       * PUBLIC COURSE API
       *
       * We intentionally use /courses instead of
       * /courses/:id because the latter is currently
       * protected for administrators.
       */

      const courseResponse = await fetch(
        `${API_BASE_URL}/courses`
      );

      const courseData = await courseResponse.json();

      if (!courseResponse.ok) {
        throw new Error(
          courseData.message ||
            "Unable to load courses."
        );
      }

      const courses = Array.isArray(
        courseData.courses
      )
        ? courseData.courses
        : [];

      const selectedCourse = courses.find(
        (item) =>
          String(item._id) === String(courseId)
      );

      if (!selectedCourse) {
        throw new Error(
          "Course not found or it is not published."
        );
      }

      setCourse(selectedCourse);

      /*
       * LOAD PUBLISHED MODULES
       */

      const moduleResponse = await fetch(
        `${API_BASE_URL}/course-modules/course/${courseId}`
      );

      const moduleData =
        await moduleResponse.json();

      if (!moduleResponse.ok) {
        throw new Error(
          moduleData.message ||
            "Unable to load course modules."
        );
      }

      const moduleList = Array.isArray(
        moduleData.modules
      )
        ? moduleData.modules
        : [];

      setModules(moduleList);

      /*
       * Automatically expand the first module.
       */

      if (moduleList.length > 0) {
        setExpandedModule(
          moduleList[0]._id
        );

        await loadLessons(moduleList);
      } else {
        setLessons({});
      }
    } catch (err) {
      console.error(
        "Course details load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load course."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * LOAD LESSONS
   * ============================================================
   */

  async function loadLessons(moduleList) {
    if (!Array.isArray(moduleList)) {
      return;
    }

    try {
      setLoadingLessons(true);

      const lessonMap = {};

      await Promise.all(
        moduleList.map(
          async (module) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/course-lessons/module/${module._id}`
              );

              const data =
                await response.json();

              if (
                response.ok &&
                Array.isArray(data.lessons)
              ) {
                lessonMap[module._id] =
                  data.lessons;
              } else {
                lessonMap[module._id] = [];
              }
            } catch (err) {
              console.error(
                `Unable to load lessons for module ${module._id}:`,
                err
              );

              lessonMap[module._id] = [];
            }
          }
        )
      );

      setLessons(lessonMap);
    } finally {
      setLoadingLessons(false);
    }
  }

  /*
   * ============================================================
   * LOAD STUDENT COURSE PROGRESS
   * ============================================================
   */

  useEffect(() => {
    if (!courseId || !token) {
      setProgress(null);
      setProgressLoading(false);
      setProgressError("");
      return;
    }

    loadProgress();
  }, [courseId, token]);

  async function loadProgress() {
    try {
      setProgressLoading(true);
      setProgressError("");

      const response = await fetch(
        `${API_BASE_URL}/course-progress/course/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your course progress."
        );
      }

      setProgress(data.progress || null);
    } catch (err) {
      console.error(
        "Course progress load error:",
        err
      );

      setProgressError(
        err.message ||
          "Unable to load course progress."
      );

      setProgress(null);
    } finally {
      setProgressLoading(false);
    }
  }

  /*
   * ============================================================
   * MODULE TOGGLE
   * ============================================================
   */

  function toggleModule(moduleId) {
    setExpandedModule(
      (current) =>
        current === moduleId
          ? null
          : moduleId
    );
  }

  /*
   * ============================================================
   * LESSON NAVIGATION
   * ============================================================
   */

  function openLesson(moduleId, lessonId) {
    if (
      !courseId ||
      !moduleId ||
      !lessonId
    ) {
      console.error(
        "Lesson navigation error:",
        {
          courseId,
          moduleId,
          lessonId,
        }
      );

      return;
    }

    window.location.href =
      `/course/${courseId}/lesson/${moduleId}/${lessonId}`;
  }

  /*
   * ============================================================
   * BACK TO COURSES
   * ============================================================
   */

  function goBack() {
    window.location.href = "/courses";
  }

  /*
   * ============================================================
   * COURSE STATS
   * ============================================================
   */

  const totalLessons = useMemo(() => {
    return Object.values(lessons).reduce(
      (total, moduleLessons) =>
        total +
        (Array.isArray(moduleLessons)
          ? moduleLessons.length
          : 0),
      0
    );
  }, [lessons]);

  const courseDuration =
    course?.duration || "Self paced";

  const courseLevel =
    course?.level === "ALL_LEVELS"
      ? "All Levels"
      : course?.level || "All Levels";

  /*
   * ============================================================
   * PROGRESS VALUES
   * ============================================================
   */

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

  const progressTotalLessons = Number(
    progress?.totalLessons ||
      totalLessons ||
      0
  );

  const completedLessonIds =
    Array.isArray(
      progress?.completedLessonIds
    )
      ? progress.completedLessonIds.map(
          (id) => String(id)
        )
      : [];

  const lastLessonId = progress?.lastLesson
    ? String(
        typeof progress.lastLesson ===
          "object"
          ? progress.lastLesson._id ||
              progress.lastLesson.id ||
              ""
          : progress.lastLesson
      )
    : "";

  /*
   * ============================================================
   * FIND RESUME LESSON
   *
   * The backend stores the last opened lesson.
   * We locate that lesson inside the loaded
   * module/lesson structure.
   * ============================================================
   */

  const resumeLesson = useMemo(() => {
    if (!lastLessonId) {
      return null;
    }

    for (const module of modules) {
      const moduleLessons = Array.isArray(
        lessons[module._id]
      )
        ? lessons[module._id]
        : [];

      const lesson = moduleLessons.find(
        (item) =>
          String(item._id) ===
          lastLessonId
      );

      if (lesson) {
        return {
          moduleId: module._id,
          lessonId: lesson._id,
          lesson,
        };
      }
    }

    return null;
  }, [
    lastLessonId,
    modules,
    lessons,
  ]);

  const firstLesson = useMemo(() => {
    for (const module of modules) {
      const moduleLessons = Array.isArray(
        lessons[module._id]
      )
        ? lessons[module._id]
        : [];

      if (moduleLessons.length > 0) {
        return {
          moduleId: module._id,
          lessonId:
            moduleLessons[0]._id,
          lesson:
            moduleLessons[0],
        };
      }
    }

    return null;
  }, [modules, lessons]);

  /*
   * ============================================================
   * PRIMARY LEARNING ACTION
   * ============================================================
   */

  function handlePrimaryLearningAction() {
    /*
     * If the course has progress and a valid
     * last opened lesson, resume from there.
     */

    if (
      progressPercentage > 0 &&
      resumeLesson
    ) {
      openLesson(
        resumeLesson.moduleId,
        resumeLesson.lessonId
      );

      return;
    }

    /*
     * Otherwise start from the first lesson.
     */

    if (firstLesson) {
      openLesson(
        firstLesson.moduleId,
        firstLesson.lessonId
      );

      return;
    }

    /*
     * If modules exist but lessons have not
     * loaded yet, expand the first module.
     */

    if (modules.length > 0) {
      setExpandedModule(
        modules[0]?._id || null
      );
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="course-details-page">
        <div className="course-details-loading">
          <div className="course-loading-orb">
            <span />
          </div>

          <p className="course-loading-label">
            OJDV LEARNING PLATFORM
          </p>

          <h2>
            Preparing your course
          </h2>

          <p>
            Loading your learning path...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !course) {
    return (
      <main className="course-details-page">
        <div className="course-details-error">
          <div className="course-error-icon">
            !
          </div>

          <p className="course-error-label">
            COURSE UNAVAILABLE
          </p>

          <h2>
            Unable to load course
          </h2>

          <p>
            {error ||
              "Course not found."}
          </p>

          <div className="course-error-actions">
            <button
              type="button"
              className="course-primary-button"
              onClick={loadCourse}
            >
              Try Again
            </button>

            <button
              type="button"
              className="course-secondary-button"
              onClick={goBack}
            >
              Back to Courses
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="course-details-page">
      <div className="course-details-background">
        <div className="course-glow course-glow-one" />
        <div className="course-glow course-glow-two" />
        <div className="course-glow course-glow-three" />
      </div>

      <div className="course-details-container">

        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <div className="course-top-navigation">
          <button
            type="button"
            className="back-to-courses-button"
            onClick={goBack}
          >
            <span className="back-arrow">
              ←
            </span>

            <span>
              Back to Courses
            </span>
          </button>

          <div className="course-breadcrumb">
            <span>
              Courses
            </span>

            <span className="breadcrumb-separator">
              /
            </span>

            <strong>
              {course.title}
            </strong>
          </div>
        </div>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="course-hero">
          <div className="course-hero-content">

            <div className="course-category">
              <span className="category-dot" />

              {course.category ||
                "Civil Services"}
            </div>

            <h1>
              {course.title}
            </h1>

            <p className="course-short-description">
              {course.shortDescription ||
                course.description ||
                "Structured preparation designed to help you learn with clarity and consistency."}
            </p>

            <div className="course-stat-row">

              <div className="course-stat">
                <div className="course-stat-icon">
                  ◈
                </div>

                <div>
                  <strong>
                    {courseLevel}
                  </strong>

                  <span>
                    Learning Level
                  </span>
                </div>
              </div>

              <div className="course-stat">
                <div className="course-stat-icon">
                  ◷
                </div>

                <div>
                  <strong>
                    {courseDuration}
                  </strong>

                  <span>
                    Course Duration
                  </span>
                </div>
              </div>

              <div className="course-stat">
                <div className="course-stat-icon">
                  ◫
                </div>

                <div>
                  <strong>
                    {modules.length}
                  </strong>

                  <span>
                    Modules
                  </span>
                </div>
              </div>

              <div className="course-stat">
                <div className="course-stat-icon">
                  ◎
                </div>

                <div>
                  <strong>
                    {totalLessons || "8+"}
                  </strong>

                  <span>
                    Lessons
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="course-hero-visual">
            <div className="hero-grid" />

            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />

            <div className="hero-course-card">

              <div className="hero-card-top">
                <span>
                  OJDV
                </span>

                <span className="hero-card-status">
                  LIVE
                </span>
              </div>

              <div className="hero-card-center">
                <div className="hero-card-symbol">
                  ◇
                </div>

                <strong>
                  {course.category ||
                    "Learning"}
                </strong>

                <span>
                  Structured Education
                </span>
              </div>

              <div className="hero-card-bottom">
                <span>
                  Learn
                </span>

                <span>
                  Practice
                </span>

                <span>
                  Progress
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ======================================================
            CURRICULUM HEADER
        ====================================================== */}

        <section className="curriculum-section">

          <div className="curriculum-heading">

            <div>
              <p className="section-eyebrow">
                LEARNING PATH
              </p>

              <h2>
                Course Curriculum
              </h2>

              <p>
                Follow a structured learning journey,
                one concept at a time.
              </p>
            </div>

            <div className="curriculum-summary">

              <div
                className="progress-ring"
                style={{
                  "--progress": `${progressPercentage}%`,
                }}
              >
                <span>
                  {progressLoading
                    ? "..."
                    : `${progressPercentage}%`}
                </span>
              </div>

              <div>
                <strong>
                  {progress?.completed
                    ? "Course Complete"
                    : "Your Progress"}
                </strong>

                <span>
                  {progressLoading
                    ? "Loading your progress..."
                    : progressError
                      ? "Progress unavailable right now"
                      : progressTotalLessons > 0
                        ? `${completedLessons} of ${progressTotalLessons} lessons completed`
                        : "No lessons available yet"}
                </span>
              </div>

            </div>
          </div>

          {/* ====================================================
              MODULES
          ==================================================== */}

          <div className="modules-list">

            {modules.length === 0 && (
              <div className="empty-curriculum">
                <div>
                  ◫
                </div>

                <h3>
                  Curriculum coming soon
                </h3>

                <p>
                  Course lessons have not been
                  published yet.
                </p>
              </div>
            )}

            {modules.map(
              (module, moduleIndex) => {

                const moduleLessons =
                  Array.isArray(
                    lessons[module._id]
                  )
                    ? lessons[module._id]
                    : [];

                const isExpanded =
                  expandedModule ===
                  module._id;

                const moduleCompletedCount =
                  moduleLessons.filter(
                    (lesson) =>
                      completedLessonIds.includes(
                        String(lesson._id)
                      )
                  ).length;

                const moduleProgress =
                  moduleLessons.length > 0
                    ? Math.round(
                        (moduleCompletedCount /
                          moduleLessons.length) *
                          100
                      )
                    : 0;

                return (
                  <article
                    className={`course-module ${
                      isExpanded
                        ? "module-expanded"
                        : ""
                    }`}
                    key={module._id}
                  >

                    {/* MODULE HEADER */}

                    <button
                      type="button"
                      className="module-header"
                      onClick={() =>
                        toggleModule(
                          module._id
                        )
                      }
                    >

                      <div className="module-number">
                        {String(
                          moduleIndex + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="module-icon">
                        {isExpanded
                          ? "⌃"
                          : "⌄"}
                      </div>

                      <div className="module-information">

                        <div className="module-title-row">
                          <h3>
                            {module.title}
                          </h3>

                          {module.isFree && (
                            <span className="free-badge">
                              FREE
                            </span>
                          )}
                        </div>

                        <p>
                          {module.description ||
                            "Build your understanding through structured lessons."}
                        </p>

                        {moduleLessons.length > 0 && (
                          <div className="module-progress">
                            <div className="module-progress-track">
                              <span
                                style={{
                                  width: `${moduleProgress}%`,
                                }}
                              />
                            </div>

                            <small>
                              {moduleCompletedCount} of{" "}
                              {moduleLessons.length}{" "}
                              completed
                            </small>
                          </div>
                        )}

                      </div>

                      <div className="module-lesson-count">
                        <strong>
                          {moduleLessons.length}
                        </strong>

                        <span>
                          {moduleLessons.length === 1
                            ? "Lesson"
                            : "Lessons"}
                        </span>
                      </div>

                      <div className="module-chevron">
                        {isExpanded
                          ? "↑"
                          : "↓"}
                      </div>

                    </button>

                    {/* LESSONS */}

                    {isExpanded && (
                      <div className="module-lessons">

                        {loadingLessons &&
                          moduleLessons.length ===
                            0 && (
                            <div className="lesson-loading">
                              Loading lessons...
                            </div>
                          )}

                        {!loadingLessons &&
                          moduleLessons.length ===
                            0 && (
                            <div className="lesson-empty">
                              No published lessons
                              in this module.
                            </div>
                          )}

                        {moduleLessons.map(
                          (
                            lesson,
                            lessonIndex
                          ) => {

                            const isCompleted =
                              completedLessonIds.includes(
                                String(
                                  lesson._id
                                )
                              );

                            const isLastLesson =
                              lastLessonId ===
                              String(
                                lesson._id
                              );

                            return (
                              <div
                                className={`lesson-card ${
                                  isCompleted
                                    ? "lesson-completed"
                                    : ""
                                } ${
                                  isLastLesson
                                    ? "lesson-last-opened"
                                    : ""
                                }`}
                                key={lesson._id}
                              >

                                <div className="lesson-number">
                                  {String(
                                    lessonIndex + 1
                                  ).padStart(2, "0")}
                                </div>

                                <div className="lesson-type-icon">
                                  {isCompleted
                                    ? "✓"
                                    : lesson.type ===
                                      "VIDEO"
                                      ? "▶"
                                      : lesson.type ===
                                          "PDF"
                                        ? "▤"
                                        : lesson.type ===
                                            "QUIZ"
                                          ? "?"
                                          : "≡"}
                                </div>

                                <div className="lesson-information">

                                  <div className="lesson-title-row">

                                    <h4>
                                      {lesson.title}
                                    </h4>

                                    {lesson.isFree && (
                                      <span className="lesson-free">
                                        FREE
                                      </span>
                                    )}

                                    {isCompleted && (
                                      <span className="lesson-complete-badge">
                                        COMPLETED
                                      </span>
                                    )}

                                    {!isCompleted &&
                                      isLastLesson && (
                                        <span className="lesson-current-badge">
                                          LAST VISITED
                                        </span>
                                      )}

                                  </div>

                                  <p>
                                    {lesson.description ||
                                      "Continue your learning with this lesson."}
                                  </p>

                                  <div className="lesson-meta">

                                    <span>
                                      ◷{" "}
                                      {lesson.duration ||
                                        "Self paced"}
                                    </span>

                                    <span className="meta-divider">
                                      |
                                    </span>

                                    <span>
                                      {lesson.type ||
                                        "LESSON"}
                                    </span>

                                  </div>

                                </div>

                                <button
                                  type="button"
                                  className="start-lesson-button"
                                  onClick={() =>
                                    openLesson(
                                      module._id,
                                      lesson._id
                                    )
                                  }
                                >

                                  <span>
                                    {isCompleted
                                      ? "Review Lesson"
                                      : isLastLesson
                                        ? "Resume Lesson"
                                        : "Start Lesson"}
                                  </span>

                                  <span className="start-arrow">
                                    {isCompleted
                                      ? "↺"
                                      : "→"}
                                  </span>

                                </button>

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                  </article>
                );
              }
            )}

          </div>

          {/* ====================================================
              BOTTOM LEARNING PANEL
          ==================================================== */}

          <div className="learning-panel">

            <div className="learning-panel-icon">
              ✦
            </div>

            <div className="learning-panel-content">

              <p>
                SMART LEARNING
              </p>

              <h3>
                {progress?.completed
                  ? "Course completed. Keep growing."
                  : resumeLesson
                    ? "Continue where you left off."
                    : "Learn at your own pace."}
              </h3>

              <span>
                {progress?.completed
                  ? "You have completed every published lesson in this course. Revisit any lesson whenever you need."
                  : resumeLesson
                    ? `Resume "${resumeLesson.lesson.title}" and continue building consistent progress.`
                    : "Pick up where you left off, revisit lessons and build consistent progress."}
              </span>

            </div>

            <div className="learning-panel-actions">

              <span>
                {modules.length} Modules
              </span>

              <span>
                {totalLessons || 0} Lessons
              </span>

              <button
                type="button"
                onClick={
                  handlePrimaryLearningAction
                }
                disabled={
                  modules.length === 0 ||
                  (!firstLesson &&
                    !resumeLesson)
                }
              >
                {progress?.completed
                  ? "Review Course →"
                  : resumeLesson
                    ? "Resume Learning →"
                    : "Begin Learning →"}
              </button>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

export default CourseDetails;