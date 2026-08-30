import { useEffect, useMemo, useState } from "react";

import AdminLayout from "./AdminLayout.jsx";
import "./AdminCourseLessons.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const LESSON_TYPES = [
  {
    value: "VIDEO",
    label: "Video",
    icon: "▶",
    description: "Teach with a hosted video.",
  },
  {
    value: "ARTICLE",
    label: "Article",
    icon: "A",
    description: "Create written learning material.",
  },
  {
    value: "PDF",
    label: "PDF / Notes",
    icon: "▤",
    description: "Attach notes or study material.",
  },
  {
    value: "QUIZ",
    label: "Quiz",
    icon: "?",
    description: "Add an interactive quiz later.",
  },
  {
    value: "ASSIGNMENT",
    label: "Assignment",
    icon: "✓",
    description: "Give students an assignment.",
  },
  {
    value: "CHALLENGE",
    label: "Challenge",
    icon: "◆",
    description: "Create a practice challenge.",
  },
];

const emptyForm = {
  title: "",
  description: "",
  type: "VIDEO",
  content: "",
  thumbnailUrl: "",
  displayOrder: "",
  duration: "",
  published: false,
  isFree: false,
};

function AdminCourseLessons({
  courseId,
  moduleId,
}) {
  const token =
    localStorage.getItem("ojdv_token");

  const [lessons, setLessons] = useState([]);
  const [module, setModule] =
    useState(null);
  const [course, setCourse] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingLesson, setEditingLesson] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [deletingId, setDeletingId] =
    useState(null);

  const selectedType = useMemo(
    () =>
      LESSON_TYPES.find(
        (item) =>
          item.value === form.type
      ) || LESSON_TYPES[0],
    [form.type]
  );

  const loadLessons = async () => {
    if (!moduleId) {
      setError("Module ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/course-lessons/admin/module/${moduleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load lessons."
        );
      }

      const nextLessons =
        Array.isArray(data.lessons)
          ? data.lessons
          : [];

      setLessons(nextLessons);

      if (nextLessons.length > 0) {
        const first =
          nextLessons[0];

        setModule(
          first.module || null
        );

        setCourse(
          first.course || null
        );
      }
    } catch (err) {
      console.error(
        "Lesson load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load lessons."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadModuleDetails =
    async () => {
      if (!moduleId) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE}/api/course-modules/${moduleId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.module
        ) {
          setModule(data.module);

          if (data.module.course) {
            setCourse(
              data.module.course
            );
          }
        }
      } catch (err) {
        console.error(
          "Module details error:",
          err
        );
      }
    };

  useEffect(() => {
    loadLessons();
    loadModuleDetails();
  }, [moduleId]);

  const openCreateForm =
    () => {
      setEditingLesson(null);

      setForm({
        ...emptyForm,
        displayOrder:
          String(lessons.length + 1),
      });

      setError("");
      setSuccess("");
      setModalOpen(true);
    };

  const openEditForm =
    (lesson) => {
      setEditingLesson(lesson);

      setForm({
        title:
          lesson.title || "",
        description:
          lesson.description || "",
        type:
          lesson.type || "VIDEO",
        content:
          lesson.content || "",
        thumbnailUrl:
          lesson.thumbnailUrl || "",
        displayOrder:
          lesson.displayOrder ??
          "",
        duration:
          lesson.duration || "",
        published:
          Boolean(
            lesson.published
          ),
        isFree:
          Boolean(
            lesson.isFree
          ),
      });

      setError("");
      setSuccess("");
      setModalOpen(true);
    };

  const closeModal =
    () => {
      if (saving) {
        return;
      }

      setModalOpen(false);
      setEditingLesson(null);
      setForm(emptyForm);
    };

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (!form.title.trim()) {
        setError(
          "Please enter a lesson title."
        );
        return;
      }

      if (!courseId) {
        setError(
          "Course ID is missing."
        );
        return;
      }

      if (!moduleId) {
        setError(
          "Module ID is missing."
        );
        return;
      }

      try {
        setSaving(true);

        const payload = {
          course: courseId,
          module: moduleId,
          title: form.title.trim(),
          description:
            form.description.trim(),
          type: form.type,
          content:
            form.content.trim(),
          thumbnailUrl:
            form.thumbnailUrl.trim(),
          displayOrder:
            Number(
              form.displayOrder
            ) || 0,
          duration:
            form.duration.trim(),
          published:
            Boolean(form.published),
          isFree:
            Boolean(form.isFree),
        };

        const url =
          editingLesson
            ? `${API_BASE}/api/course-lessons/${editingLesson._id}`
            : `${API_BASE}/api/course-lessons`;

        const method =
          editingLesson
            ? "PUT"
            : "POST";

        const response =
          await fetch(url, {
            method,
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(
              payload
            ),
          });

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save lesson."
          );
        }

        setSuccess(
          editingLesson
            ? "Lesson updated successfully."
            : "Lesson created successfully."
        );

        setModalOpen(false);
        setEditingLesson(null);
        setForm(emptyForm);

        await loadLessons();

        window.setTimeout(() => {
          setSuccess("");
        }, 3000);
      } catch (err) {
        console.error(
          "Lesson save error:",
          err
        );

        setError(
          err.message ||
            "Unable to save lesson."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async (lesson) => {
      const confirmed =
        window.confirm(
          `Delete "${lesson.title}"? This cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          lesson._id
        );

        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE}/api/course-lessons/${lesson._id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to delete lesson."
          );
        }

        setSuccess(
          "Lesson deleted successfully."
        );

        await loadLessons();

        window.setTimeout(() => {
          setSuccess("");
        }, 3000);
      } catch (err) {
        console.error(
          "Lesson delete error:",
          err
        );

        setError(
          err.message ||
            "Unable to delete lesson."
        );
      } finally {
        setDeletingId(null);
      }
    };

  const goBackToModules =
    () => {
      window.location.href =
        `/admin/courses/${courseId}/modules`;
    };

  const getTypeInfo =
    (type) =>
      LESSON_TYPES.find(
        (item) =>
          item.value === type
      ) ||
      LESSON_TYPES[0];

  return (
    <AdminLayout activePage="courses">
      <section className="lessons-page">

        <div className="lessons-breadcrumb">
          <button
            type="button"
            onClick={
              goBackToModules
            }
          >
            ← Courses
          </button>

          <span>/</span>

          <span>
            Content
          </span>

          <span>/</span>

          <strong>
            {module?.title ||
              "Module"}
          </strong>
        </div>

        <section className="lessons-header">

          <div>
            <span className="admin-section-kicker">
              COURSE CONTENT
            </span>

            <h2>
              {module?.title ||
                "Module"}
              <span>.</span>
            </h2>

            <p>
              {course?.title ||
                "Course"}{" "}
              · Build the lessons
              inside this module.
            </p>
          </div>

          <button
            type="button"
            className="lessons-add-button"
            onClick={
              openCreateForm
            }
          >
            <span>+</span>
            Add Lesson
          </button>

        </section>

        {error && (
          <div className="lessons-alert lessons-alert-error">
            <span>!</span>
            {error}
          </div>
        )}

        {success && (
          <div className="lessons-alert lessons-alert-success">
            <span>✓</span>
            {success}
          </div>
        )}

        <section className="lessons-summary">

          <div className="lessons-summary-card">
            <span>
              TOTAL LESSONS
            </span>

            <strong>
              {lessons.length}
            </strong>
          </div>

          <div className="lessons-summary-card">
            <span>
              PUBLISHED
            </span>

            <strong>
              {
                lessons.filter(
                  (lesson) =>
                    lesson.published
                ).length
              }
            </strong>
          </div>

          <div className="lessons-summary-card">
            <span>
              FREE PREVIEW
            </span>

            <strong>
              {
                lessons.filter(
                  (lesson) =>
                    lesson.isFree
                ).length
              }
            </strong>
          </div>

        </section>

        {loading ? (
          <section className="lessons-empty-state">
            <div className="lessons-spinner" />

            <h3>
              Loading lessons
            </h3>

            <p>
              Fetching this
              module's content...
            </p>
          </section>
        ) : lessons.length ===
          0 ? (
          <section className="lessons-empty-state">

            <div className="lessons-empty-icon">
              +
            </div>

            <span className="lessons-empty-kicker">
              EMPTY MODULE
            </span>

            <h3>
              No lessons yet.
            </h3>

            <p>
              Start building this
              module by adding your
              first lesson.
            </p>

            <button
              type="button"
              className="lessons-empty-button"
              onClick={
                openCreateForm
              }
            >
              + Add First Lesson
            </button>

          </section>
        ) : (
          <section className="lessons-list">

            {lessons.map(
              (lesson, index) => {
                const typeInfo =
                  getTypeInfo(
                    lesson.type
                  );

                return (
                  <article
                    key={
                      lesson._id
                    }
                    className="lesson-card"
                  >

                    <div className="lesson-number">
                      {String(
                        lesson.displayOrder ||
                          index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="lesson-type-icon">
                      {typeInfo.icon}
                    </div>

                    <div className="lesson-main">

                      <div className="lesson-title-row">

                        <h3>
                          {lesson.title}
                        </h3>

                        <span
                          className={`lesson-status ${
                            lesson.published
                              ? "lesson-status-published"
                              : "lesson-status-draft"
                          }`}
                        >
                          {lesson.published
                            ? "Published"
                            : "Draft"}
                        </span>

                        {lesson.isFree && (
                          <span className="lesson-free-badge">
                            Free
                          </span>
                        )}

                      </div>

                      <p>
                        {lesson.description ||
                          "No description added."}
                      </p>

                      <div className="lesson-meta">

                        <span>
                          {typeInfo.label}
                        </span>

                        {lesson.duration && (
                          <span>
                            {lesson.duration}
                          </span>
                        )}

                        <span>
                          Order{" "}
                          {lesson.displayOrder ??
                            index + 1}
                        </span>

                      </div>

                    </div>

                    <div className="lesson-actions">

                      <button
                        type="button"
                        className="lesson-edit-button"
                        onClick={() =>
                          openEditForm(
                            lesson
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="lesson-delete-button"
                        disabled={
                          deletingId ===
                          lesson._id
                        }
                        onClick={() =>
                          handleDelete(
                            lesson
                          )
                        }
                      >
                        {deletingId ===
                        lesson._id
                          ? "..."
                          : "Delete"}
                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

      </section>

      {modalOpen && (
        <div
          className="lesson-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="lesson-modal">

            <div className="lesson-modal-header">

              <div>
                <span>
                  {editingLesson
                    ? "EDIT LESSON"
                    : "NEW LESSON"}
                </span>

                <h3>
                  {editingLesson
                    ? "Edit lesson"
                    : "Add a lesson"}
                </h3>

                <p>
                  Keep your content
                  simple. You can
                  expand it later.
                </p>
              </div>

              <button
                type="button"
                className="lesson-modal-close"
                onClick={
                  closeModal
                }
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="lesson-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="lesson-form-section">

                <label>
                  Lesson title
                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. What is UPSC?"
                    maxLength={200}
                    autoFocus
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target
                          .value
                      )
                    }
                    placeholder="Briefly explain what students will learn..."
                    rows={4}
                    maxLength={5000}
                  />
                </label>

              </div>

              <div className="lesson-form-section">

                <div className="lesson-form-label">
                  Content type
                </div>

                <div className="lesson-type-grid">

                  {LESSON_TYPES.map(
                    (type) => (
                      <button
                        key={
                          type.value
                        }
                        type="button"
                        className={`lesson-type-option ${
                          form.type ===
                          type.value
                            ? "lesson-type-option-active"
                            : ""
                        }`}
                        onClick={() =>
                          updateField(
                            "type",
                            type.value
                          )
                        }
                      >
                        <span>
                          {type.icon}
                        </span>

                        <strong>
                          {type.label}
                        </strong>

                        <small>
                          {type.description}
                        </small>
                      </button>
                    )
                  )}

                </div>

              </div>

              <div className="lesson-form-section">

                <div className="lesson-content-heading">
                  <div>
                    <span>
                      {selectedType.icon}
                    </span>

                    <strong>
                      {selectedType.label}
                    </strong>
                  </div>

                  <small>
                    {selectedType.description}
                  </small>
                </div>

                {form.type ===
                  "VIDEO" && (
                  <>
                    <label>
                      Video URL
                      <input
                        type="url"
                        value={
                          form.content
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "content",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="https://..."
                      />
                    </label>

                    <label>
                      Duration
                      <input
                        type="text"
                        value={
                          form.duration
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "duration",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="e.g. 24 min"
                        maxLength={50}
                      />
                    </label>
                  </>
                )}

                {form.type ===
                  "PDF" && (
                  <label>
                    PDF / Notes URL
                    <input
                      type="url"
                      value={
                        form.content
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "content",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="https://..."
                    />
                  </label>
                )}

                {form.type ===
                  "ARTICLE" && (
                  <label>
                    Article content
                    <textarea
                      value={
                        form.content
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "content",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Write the lesson content here..."
                      rows={10}
                    />
                  </label>
                )}

                {(form.type ===
                  "QUIZ" ||
                  form.type ===
                    "ASSIGNMENT" ||
                  form.type ===
                    "CHALLENGE") && (
                  <label>
                    Instructions / content
                    <textarea
                      value={
                        form.content
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "content",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={`Describe the ${selectedType.label.toLowerCase()} content. We will add its dedicated builder later.`}
                      rows={8}
                    />
                  </label>
                )}

                <label>
                  Thumbnail URL
                  <input
                    type="url"
                    value={
                      form.thumbnailUrl
                    }
                    onChange={(event) =>
                      updateField(
                        "thumbnailUrl",
                        event.target
                          .value
                      )
                    }
                    placeholder="Optional image URL"
                  />
                </label>

              </div>

              <div className="lesson-form-grid">

                <label>
                  Display order
                  <input
                    type="number"
                    min="0"
                    value={
                      form.displayOrder
                    }
                    onChange={(event) =>
                      updateField(
                        "displayOrder",
                        event.target
                          .value
                      )
                    }
                  />
                </label>

                <div className="lesson-toggle-stack">

                  <label className="lesson-toggle">
                    <input
                      type="checkbox"
                      checked={
                        form.published
                      }
                      onChange={(event) =>
                        updateField(
                          "published",
                          event.target
                            .checked
                        )
                      }
                    />

                    <span />

                    <div>
                      <strong>
                        Published
                      </strong>

                      <small>
                        Visible to students
                      </small>
                    </div>
                  </label>

                  <label className="lesson-toggle">
                    <input
                      type="checkbox"
                      checked={
                        form.isFree
                      }
                      onChange={(event) =>
                        updateField(
                          "isFree",
                          event.target
                            .checked
                        )
                      }
                    />

                    <span />

                    <div>
                      <strong>
                        Free preview
                      </strong>

                      <small>
                        Accessible without purchase
                      </small>
                    </div>
                  </label>

                </div>

              </div>

              <div className="lesson-form-actions">

                <button
                  type="button"
                  className="lesson-cancel-button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="lesson-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingLesson
                      ? "Save Changes"
                      : "Create Lesson"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCourseLessons;