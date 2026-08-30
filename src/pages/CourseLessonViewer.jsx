import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../auth/AuthContext.jsx";

import "./CourseLessonViewer.css";

const API_BASE_URL = "/api";

function CourseLessonViewer({
  courseId,
  moduleId,
  lessonId,
}) {
  const { token } = useAuth();

  const [course, setCourse] =
    useState(null);

  const [module, setModule] =
    useState(null);

  const [lesson, setLesson] =
    useState(null);

  const [lessons, setLessons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [progress, setProgress] =
    useState(null);

  const [progressLoading, setProgressLoading] =
    useState(true);

  const [completionLoading, setCompletionLoading] =
    useState(false);

  const [progressError, setProgressError] =
    useState("");

  /*
   * ============================================================
   * AUTHENTICATED REQUEST HELPER
   * ============================================================
   */

  function getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    return headers;
  }

  /*
   * ============================================================
   * LOAD COURSE / MODULE / LESSON
   * ============================================================
   */

  useEffect(() => {
    if (
      !courseId ||
      !moduleId ||
      !lessonId
    ) {
      setError(
        "Course, module, or lesson information is missing."
      );

      setLoading(false);

      return;
    }

    loadLesson();
  }, [
    courseId,
    moduleId,
    lessonId,
  ]);

  async function loadLesson() {
    try {
      setLoading(true);
      setError("");

      /*
       * --------------------------------------------------------
       * COURSE
       * --------------------------------------------------------
       */

      const courseResponse =
        await fetch(
          `${API_BASE_URL}/courses`
        );

      const courseData =
        await courseResponse.json();

      if (!courseResponse.ok) {
        throw new Error(
          courseData.message ||
            "Unable to load courses."
        );
      }

      const courses =
        Array.isArray(
          courseData.courses
        )
          ? courseData.courses
          : [];

      const selectedCourse =
        courses.find(
          (item) =>
            String(item._id) ===
            String(courseId)
        );

      if (!selectedCourse) {
        throw new Error(
          "Course not found or it is not published."
        );
      }

      setCourse(
        selectedCourse
      );

      /*
       * --------------------------------------------------------
       * MODULES
       * --------------------------------------------------------
       */

      const moduleResponse =
        await fetch(
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

      const courseModules =
        Array.isArray(
          moduleData.modules
        )
          ? moduleData.modules
          : [];

      const currentModule =
        courseModules.find(
          (item) =>
            String(item._id) ===
            String(moduleId)
        );

      if (!currentModule) {
        throw new Error(
          "Module not found."
        );
      }

      setModule(
        currentModule
      );

      /*
       * --------------------------------------------------------
       * LESSONS
       * --------------------------------------------------------
       */

      const lessonResponse =
        await fetch(
          `${API_BASE_URL}/course-lessons/module/${moduleId}`
        );

      const lessonData =
        await lessonResponse.json();

      if (!lessonResponse.ok) {
        throw new Error(
          lessonData.message ||
            "Unable to load lessons."
        );
      }

      const moduleLessons =
        Array.isArray(
          lessonData.lessons
        )
          ? lessonData.lessons
          : [];

      setLessons(
        moduleLessons
      );

      /*
       * --------------------------------------------------------
       * CURRENT LESSON
       * --------------------------------------------------------
       */

      const currentLesson =
        moduleLessons.find(
          (item) =>
            String(item._id) ===
            String(lessonId)
        );

      if (!currentLesson) {
        throw new Error(
          "Lesson not found or it is not published."
        );
      }

      setLesson(
        currentLesson
      );
    } catch (err) {
      console.error(
        "Lesson viewer load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load lesson."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * LOAD STUDENT COURSE PROGRESS
   * ============================================================
   */

  useEffect(() => {
    if (
      !courseId ||
      !token
    ) {
      setProgressLoading(false);
      return;
    }

    loadProgress();
  }, [
    courseId,
    token,
  ]);

  async function loadProgress() {
    try {
      setProgressLoading(true);
      setProgressError("");

      const response =
        await fetch(
          `${API_BASE_URL}/course-progress/course/${courseId}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your course progress."
        );
      }

      setProgress(
        data.progress || null
      );
    } catch (err) {
      console.error(
        "Course progress load error:",
        err
      );

      setProgressError(
        err.message ||
          "Unable to load course progress."
      );
    } finally {
      setProgressLoading(false);
    }
  }

  /*
   * ============================================================
   * RECORD LAST OPENED LESSON
   * ============================================================
   */

  useEffect(() => {
    if (
      !courseId ||
      !lessonId ||
      !token ||
      loading ||
      !lesson
    ) {
      return;
    }

    updateLastOpenedLesson();
  }, [
    courseId,
    lessonId,
    token,
    loading,
    lesson,
  ]);

  async function updateLastOpenedLesson() {
    try {
      await fetch(
        `${API_BASE_URL}/course-progress/course/${courseId}/lesson/${lessonId}/open`,
        {
          method: "POST",
          headers:
            getAuthHeaders(),
        }
      );
    } catch (err) {
      /*
       * Last-opened tracking should never
       * prevent the lesson from loading.
       */

      console.warn(
        "Unable to update last opened lesson:",
        err
      );
    }
  }

  /*
   * ============================================================
   * LESSON COMPLETION
   * ============================================================
   */

  const completedLessonIds =
    progress?.completedLessonIds ||
    [];

  const isCompleted =
    completedLessonIds.some(
      (id) =>
        String(id) ===
        String(lessonId)
    );

  async function markLessonComplete() {
    if (
      !token ||
      !courseId ||
      !lessonId ||
      completionLoading
    ) {
      return;
    }

    try {
      setCompletionLoading(true);
      setProgressError("");

      const response =
        await fetch(
          `${API_BASE_URL}/course-progress/course/${courseId}/lesson/${lessonId}/complete`,
          {
            method: "POST",
            headers:
              getAuthHeaders(),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to mark lesson as complete."
        );
      }

      /*
       * Update the UI immediately from
       * the backend response.
       */

      if (data.progress) {
        setProgress(
          (previous) => ({
            ...(previous || {}),
            ...data.progress,
            completedLessonIds:
              Array.isArray(
                data.progress
                  .completedLessonIds
              )
                ? data.progress
                    .completedLessonIds
                : completedLessonIds,
          })
        );
      }

      /*
       * Refresh the complete progress object
       * to keep everything synchronized.
       */

      await loadProgress();
    } catch (err) {
      console.error(
        "Complete lesson error:",
        err
      );

      setProgressError(
        err.message ||
          "Unable to mark lesson as complete."
      );
    } finally {
      setCompletionLoading(false);
    }
  }

  async function markLessonIncomplete() {
    if (
      !token ||
      !courseId ||
      !lessonId ||
      completionLoading
    ) {
      return;
    }

    try {
      setCompletionLoading(true);
      setProgressError("");

      const response =
        await fetch(
          `${API_BASE_URL}/course-progress/course/${courseId}/lesson/${lessonId}/uncomplete`,
          {
            method: "POST",
            headers:
              getAuthHeaders(),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update lesson progress."
        );
      }

      if (data.progress) {
        setProgress(
          (previous) => ({
            ...(previous || {}),
            ...data.progress,
            completedLessonIds:
              Array.isArray(
                data.progress
                  .completedLessonIds
              )
                ? data.progress
                    .completedLessonIds
                : [],
          })
        );
      }

      await loadProgress();
    } catch (err) {
      console.error(
        "Uncomplete lesson error:",
        err
      );

      setProgressError(
        err.message ||
          "Unable to update lesson progress."
      );
    } finally {
      setCompletionLoading(false);
    }
  }

  /*
   * ============================================================
   * LESSON NAVIGATION
   * ============================================================
   */

  const currentIndex =
    useMemo(
      () =>
        lessons.findIndex(
          (item) =>
            String(item._id) ===
            String(lessonId)
        ),
      [
        lessons,
        lessonId,
      ]
    );

  const previousLesson =
    currentIndex > 0
      ? lessons[
          currentIndex - 1
        ]
      : null;

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      lessons.length - 1
      ? lessons[
          currentIndex + 1
        ]
      : null;

  /*
   * ============================================================
   * NAVIGATION HELPERS
   * ============================================================
   */

  function goBack() {
    window.location.href =
      `/course/${courseId}`;
  }

  function openLesson(
    lessonItem
  ) {
    if (!lessonItem?._id) {
      return;
    }

    window.location.href =
      `/course/${courseId}/lesson/${moduleId}/${lessonItem._id}`;
  }

  /*
   * ============================================================
   * YOUTUBE
   * ============================================================
   */

  function getYouTubeEmbedUrl(
    url
  ) {
    if (!url) {
      return "";
    }

    try {
      const parsed =
        new URL(url);

      if (
        parsed.hostname.includes(
          "youtube.com"
        )
      ) {
        const videoId =
          parsed.searchParams.get(
            "v"
          );

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?rel=0`;
        }
      }

      if (
        parsed.hostname ===
          "youtu.be" ||
        parsed.hostname.endsWith(
          ".youtu.be"
        )
      ) {
        const videoId =
          parsed.pathname
            .replace(
              "/",
              ""
            )
            .trim();

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?rel=0`;
        }
      }

      return url;
    } catch {
      return url;
    }
  }

  /*
   * ============================================================
   * VIDEO DATA
   * ============================================================
   */

  const videoUrl =
    lesson?.videoUrl ||
    lesson?.videoURL ||
    lesson?.video ||
    "";

  const embedUrl =
    getYouTubeEmbedUrl(
      videoUrl
    );

  /*
   * ============================================================
   * PROGRESS DISPLAY
   * ============================================================
   */

  const progressPercentage =
    Number(
      progress?.progressPercentage ||
        0
    );

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="lesson-page lesson-page-loading">
        <div className="lesson-loading-card">
          <div className="lesson-loading-orb" />

          <div>
            <span className="lesson-loading-label">
              OJDV EDUCATION
            </span>

            <h2>
              Preparing your lesson
            </h2>

            <p>
              Loading course content and
              learning resources.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (
    error ||
    !lesson
  ) {
    return (
      <main className="lesson-page lesson-page-error">
        <div className="lesson-error-card">
          <div className="lesson-error-icon">
            !
          </div>

          <span className="lesson-error-label">
            LESSON ERROR
          </span>

          <h1>
            Unable to open lesson
          </h1>

          <p>
            {error ||
              "The requested lesson could not be found."}
          </p>

          <button
            type="button"
            className="lesson-primary-button"
            onClick={goBack}
          >
            <span>
              ←
            </span>

            Back to Course
          </button>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * MAIN PAGE
   * ============================================================
   */

  return (
    <main className="lesson-page">

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <header className="lesson-topbar">

        <div className="lesson-topbar-left">

          <button
            type="button"
            className="lesson-back-button"
            onClick={goBack}
          >
            <span>
              ←
            </span>

            Back to Course
          </button>

          <div className="lesson-topbar-divider" />

          <div className="lesson-course-name">
            {course?.title ||
              "Course"}
          </div>

        </div>

        <div className="lesson-topbar-right">

          <div className="lesson-progress-summary">

            <span>
              COURSE PROGRESS
            </span>

            <strong>
              {progressLoading
                ? "..."
                : `${progressPercentage}%`}
            </strong>

          </div>

          <button
            type="button"
            className="lesson-outline-button"
            onClick={() =>
              setSidebarOpen(
                (current) =>
                  !current
              )
            }
          >
            <span>
              ☰
            </span>

            Course Outline
          </button>

        </div>
      </header>

      {/* ======================================================
          PAGE BODY
      ====================================================== */}

      <div className="lesson-layout">

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <section className="lesson-main">

          {/* --------------------------------------------------
              TITLE
          -------------------------------------------------- */}

          <div className="lesson-title-section">

            <div className="lesson-kicker">

              <span>
                MODULE{" "}
                {String(
                  module?.displayOrder ||
                    1
                ).padStart(
                  2,
                  "0"
                )}
              </span>

              <span className="kicker-dot">
                •
              </span>

              <span>
                LESSON{" "}
                {String(
                  currentIndex + 1
                ).padStart(
                  2,
                  "0"
                )}
              </span>

            </div>

            <div className="lesson-title-row">

              <div className="lesson-title-copy">

                <h1>
                  {lesson.title}
                </h1>

                {lesson.description && (
                  <p>
                    {lesson.description}
                  </p>
                )}

              </div>

              <div className="lesson-number">
                {String(
                  currentIndex + 1
                ).padStart(
                  2,
                  "0"
                )}
              </div>

            </div>

            <div className="lesson-meta">

              {lesson.duration && (
                <span>
                  <b>
                    ◷
                  </b>

                  {lesson.duration}
                </span>
              )}

              {lesson.type && (
                <span>
                  <b>
                    ▤
                  </b>

                  {lesson.type}
                </span>
              )}

              {lesson.isFree && (
                <span className="free-badge">
                  FREE
                </span>
              )}

            </div>

          </div>

          {/* --------------------------------------------------
              VIDEO
          -------------------------------------------------- */}

          {embedUrl && (
            <div className="lesson-video-card">

              <div className="lesson-video-frame">

                <iframe
                  src={embedUrl}
                  title={
                    lesson.title
                  }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

              </div>

            </div>
          )}

          {/* --------------------------------------------------
              ARTICLE CONTENT
          -------------------------------------------------- */}

          <article className="lesson-content-card">

            <div className="lesson-content-heading">

              <div className="content-heading-icon">
                Aa
              </div>

              <div>

                <span>
                  LESSON CONTENT
                </span>

                <h2>
                  {lesson.title}
                </h2>

              </div>

            </div>

            <div className="lesson-content-divider" />

            <div className="lesson-content-body">

              {lesson.content ? (
                lesson.content
                  .split(
                    /\n\s*\n/
                  )
                  .map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={
                          index
                        }
                      >
                        {paragraph}
                      </p>
                    )
                  )
              ) : (
                <div className="lesson-empty-content">

                  <div>
                    —
                  </div>

                  <h3>
                    Content coming soon
                  </h3>

                  <p>
                    Learning material for
                    this lesson has not
                    been added yet.
                  </p>

                </div>
              )}

            </div>

          </article>

          {/* --------------------------------------------------
              COMPLETION
          -------------------------------------------------- */}

          <section className="lesson-completion-card">

            <div className="lesson-completion-copy">

              <span className="lesson-completion-label">
                LEARNING PROGRESS
              </span>

              <h3>
                {isCompleted
                  ? "Lesson completed"
                  : "Finished this lesson?"}
              </h3>

              <p>
                {isCompleted
                  ? "Your progress has been saved. You can revisit this lesson anytime."
                  : "Mark this lesson complete to keep your course progress up to date."}
              </p>

              {progressError && (
                <span className="lesson-progress-error">
                  {progressError}
                </span>
              )}

            </div>

            <button
              type="button"
              className={`lesson-complete-button ${
                isCompleted
                  ? "lesson-complete-button-done"
                  : ""
              }`}
              disabled={
                completionLoading ||
                progressLoading
              }
              onClick={
                isCompleted
                  ? markLessonIncomplete
                  : markLessonComplete
              }
            >
              {completionLoading ? (
                <>
                  <span className="lesson-button-spinner" />

                  Saving...
                </>
              ) : isCompleted ? (
                <>
                  <span>
                    ✓
                  </span>

                  Completed
                </>
              ) : (
                <>
                  <span>
                    ✓
                  </span>

                  Mark as Complete
                </>
              )}
            </button>

          </section>

          {/* --------------------------------------------------
              LESSON NAVIGATION
          -------------------------------------------------- */}

          <div className="lesson-navigation">

            <button
              type="button"
              className={`lesson-nav-card ${
                !previousLesson
                  ? "lesson-nav-disabled"
                  : ""
              }`}
              disabled={
                !previousLesson
              }
              onClick={() =>
                openLesson(
                  previousLesson
                )
              }
            >

              <span className="lesson-nav-direction">
                ← Previous
              </span>

              <strong>
                {previousLesson?.title ||
                  "No previous lesson"}
              </strong>

            </button>

            <button
              type="button"
              className={`lesson-nav-card lesson-nav-next ${
                !nextLesson
                  ? "lesson-nav-disabled"
                  : ""
              }`}
              disabled={
                !nextLesson
              }
              onClick={() =>
                openLesson(
                  nextLesson
                )
              }
            >

              <span className="lesson-nav-direction">
                Next →
              </span>

              <strong>
                {nextLesson?.title ||
                  "Course complete"}
              </strong>

            </button>

          </div>

        </section>

        {/* ====================================================
            COURSE OUTLINE
        ==================================================== */}

        {sidebarOpen && (
          <aside className="lesson-sidebar">

            <div className="lesson-sidebar-header">

              <span>
                COURSE OUTLINE
              </span>

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(
                    false
                  )
                }
                aria-label="Close course outline"
              >
                ×
              </button>

            </div>

            <div className="lesson-sidebar-course">

              <strong>
                {course?.title ||
                  "Course"}
              </strong>

              <div className="lesson-sidebar-progress">

                <div className="lesson-sidebar-progress-track">

                  <div
                    className="lesson-sidebar-progress-fill"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />

                </div>

                <span>
                  {progressPercentage}%
                </span>

              </div>

            </div>

            <div className="lesson-sidebar-list">

              {lessons.map(
                (
                  item,
                  index
                ) => {
                  const itemCompleted =
                    completedLessonIds.some(
                      (id) =>
                        String(id) ===
                        String(
                          item._id
                        )
                    );

                  const itemActive =
                    String(
                      item._id
                    ) ===
                    String(
                      lessonId
                    );

                  return (
                    <button
                      type="button"
                      key={
                        item._id
                      }
                      className={`lesson-sidebar-item ${
                        itemActive
                          ? "lesson-sidebar-item-active"
                          : ""
                      } ${
                        itemCompleted
                          ? "lesson-sidebar-item-completed"
                          : ""
                      }`}
                      onClick={() =>
                        openLesson(
                          item
                        )
                      }
                    >

                      <span className="lesson-sidebar-index">

                        {itemCompleted
                          ? "✓"
                          : String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}

                      </span>

                      <span className="lesson-sidebar-item-title">
                        {item.title}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </aside>
        )}

      </div>

    </main>
  );
}

export default CourseLessonViewer;