import { useEffect, useState } from "react";

import AdminLayout from "./AdminLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";

import "./AdminCourseModules.css";

const API_BASE_URL = import.meta.env.PROD ? "https://ojd-version.onrender.com/api" : "http://127.0.0.1:5000/api";

function AdminCourseModules({ courseId }) {
  const { token } = useAuth();

  const [modules, setModules] = useState([]);
  const [course, setCourse] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    displayOrder: 1,
    published: false,
    isFree: false,
  });

  const getCourseId = () => {
    if (courseId) {
      return courseId;
    }

    const parts =
      window.location.pathname.split("/");

    const index =
      parts.indexOf("courses");

    if (
      index !== -1 &&
      parts[index + 1]
    ) {
      return parts[index + 1];
    }

    return "";
  };

  const currentCourseId =
    getCourseId();

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const loadModules = async () => {
    if (!currentCourseId || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/course-modules/admin/course/${currentCourseId}`,
        {
          headers: getHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load course modules."
        );
      }

      setModules(
        data.modules || []
      );
    } catch (err) {
      console.error(
        "Course modules load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load course modules."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCourse = async () => {
    if (!currentCourseId || !token) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/courses/${currentCourseId}`,
          {
            headers: getHeaders(),
          }
        );

      const data =
        await response.json();

      if (
        response.ok &&
        data.course
      ) {
        setCourse(
          data.course
        );
      }
    } catch (err) {
      console.error(
        "Course load error:",
        err
      );
    }
  };

  useEffect(() => {
    loadCourse();
    loadModules();
  }, [currentCourseId, token]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      displayOrder:
        modules.length + 1,
      published: false,
      isFree: false,
    });

    setEditingModule(null);
  };

  const openCreateForm = () => {
    setSuccess("");
    setError("");

    setForm({
      title: "",
      description: "",
      displayOrder:
        modules.length + 1,
      published: false,
      isFree: false,
    });

    setEditingModule(null);
    setShowForm(true);
  };

  const openEditForm = (module) => {
    setSuccess("");
    setError("");

    setEditingModule(module);

    setForm({
      title: module.title || "",
      description:
        module.description || "",
      displayOrder:
        module.displayOrder ?? 1,
      published:
        Boolean(module.published),
      isFree:
        Boolean(module.isFree),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError(
        "Module title is required."
      );
      return;
    }

    if (!currentCourseId) {
      setError(
        "Course ID is missing."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        course: currentCourseId,
        title:
          form.title.trim(),
        description:
          form.description.trim(),
        displayOrder:
          Number(
            form.displayOrder
          ) || 0,
        published:
          Boolean(form.published),
        isFree:
          Boolean(form.isFree),
      };

      const url =
        editingModule
          ? `${API_BASE_URL}/course-modules/${editingModule._id}`
          : `${API_BASE_URL}/course-modules`;

      const method =
        editingModule
          ? "PUT"
          : "POST";

      const response =
        await fetch(url, {
          method,
          headers: getHeaders(),
          body: JSON.stringify(
            payload
          ),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save course module."
        );
      }

      setSuccess(
        editingModule
          ? "Module updated successfully."
          : "Module created successfully."
      );

      setShowForm(false);
      resetForm();

      await loadModules();
    } catch (err) {
      console.error(
        "Course module save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save course module."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    module
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${module.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_BASE_URL}/course-modules/${module._id}`,
          {
            method: "DELETE",
            headers: getHeaders(),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete course module."
        );
      }

      setSuccess(
        "Module deleted successfully."
      );

      await loadModules();
    } catch (err) {
      console.error(
        "Course module delete error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete course module."
      );
    }
  };

  const togglePublished = async (
    module
  ) => {
    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_BASE_URL}/course-modules/${module._id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
              published:
                !module.published,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update module status."
        );
      }

      setSuccess(
        !module.published
          ? "Module published."
          : "Module moved to draft."
      );

      await loadModules();
    } catch (err) {
      console.error(
        "Module status update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update module status."
      );
    }
  };

  const openLessons = (
    module
  ) => {
    window.location.href =
      `/admin/courses/${currentCourseId}/modules/${module._id}/lessons`;
  };

  if (!currentCourseId) {
    return (
      <AdminLayout activePage="courses">
        <section className="course-modules-page">
          <div className="course-modules-empty">
            <div className="course-modules-empty-icon">
              !
            </div>

            <h2>
              Course not selected
            </h2>

            <p>
              Open a course from the
              Course Management page
              to manage its content.
            </p>
          </div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="courses">
      <section className="course-modules-page">

        <header className="course-modules-header">
          <div>
            <span className="course-modules-kicker">
              COURSE CONTENT
            </span>

            <h2>
              {course?.title ||
                "Course Modules"}
              <span>.</span>
            </h2>

            <p>
              Build and organize the
              learning structure of
              this course.
            </p>
          </div>

          <button
            type="button"
            className="course-modules-primary-button"
            onClick={
              openCreateForm
            }
          >
            <span>+</span>
            Add Module
          </button>
        </header>

        {error && (
          <div className="course-modules-alert course-modules-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="course-modules-alert course-modules-alert-success">
            {success}
          </div>
        )}

        <section className="course-modules-toolbar">
          <div>
            <strong>
              {modules.length}
            </strong>

            <span>
              {modules.length === 1
                ? " module"
                : " modules"}
            </span>
          </div>

          <button
            type="button"
            className="course-modules-refresh"
            onClick={
              loadModules
            }
            disabled={loading}
          >
            Refresh
          </button>
        </section>

        {loading ? (
          <div className="course-modules-state">
            <div className="course-modules-loader" />

            <p>
              Loading course
              modules...
            </p>
          </div>
        ) : modules.length ===
          0 ? (
          <div className="course-modules-state">
            <div className="course-modules-empty-icon">
              +
            </div>

            <h3>
              No modules yet
            </h3>

            <p>
              Start building this
              course by adding your
              first module.
            </p>

            <button
              type="button"
              className="course-modules-primary-button"
              onClick={
                openCreateForm
              }
            >
              <span>+</span>
              Create First Module
            </button>
          </div>
        ) : (
          <div className="course-modules-list">

            {modules.map(
              (module, index) => (
                <article
                  className="course-module-card"
                  key={module._id}
                >
                  <div className="course-module-number">
                    {index + 1}
                  </div>

                  <div className="course-module-main">

                    <div className="course-module-heading">

                      <div>
                        <span className="course-module-label">
                          MODULE{" "}
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <h3>
                          {module.title}
                        </h3>
                      </div>

                      <div className="course-module-badges">

                        <span
                          className={
                            module.published
                              ? "course-module-badge course-module-badge-published"
                              : "course-module-badge course-module-badge-draft"
                          }
                        >
                          {module.published
                            ? "Published"
                            : "Draft"}
                        </span>

                        {module.isFree && (
                          <span className="course-module-badge course-module-badge-free">
                            Free
                          </span>
                        )}

                      </div>
                    </div>

                    {module.description && (
                      <p>
                        {
                          module.description
                        }
                      </p>
                    )}

                    <div className="course-module-meta">

                      <span>
                        Order:{" "}
                        {
                          module.displayOrder
                        }
                      </span>

                      <span>
                        Created:{" "}
                        {module.createdAt
                          ? new Date(
                              module.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </span>

                    </div>

                  </div>

                  <div className="course-module-actions">

                    <button
                      type="button"
                      className="course-module-lessons-button"
                      onClick={() =>
                        openLessons(
                          module
                        )
                      }
                    >
                      Lessons
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        togglePublished(
                          module
                        )
                      }
                    >
                      {module.published
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(
                          module
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="course-module-delete"
                      onClick={() =>
                        handleDelete(
                          module
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>
                </article>
              )
            )}

          </div>
        )}

        {showForm && (
          <div
            className="course-module-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeForm();
              }
            }}
          >
            <div className="course-module-modal">

              <header className="course-module-modal-header">

                <div>
                  <span>
                    {editingModule
                      ? "EDIT MODULE"
                      : "NEW MODULE"}
                  </span>

                  <h3>
                    {editingModule
                      ? "Edit course module"
                      : "Create course module"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="course-module-close"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                  aria-label="Close"
                >
                  ×
                </button>

              </header>

              <form
                className="course-module-form"
                onSubmit={
                  handleSubmit
                }
              >

                <div className="course-module-field">

                  <label htmlFor="module-title">
                    Module title
                  </label>

                  <input
                    id="module-title"
                    name="title"
                    type="text"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Indian Polity"
                    maxLength={200}
                    required
                  />

                </div>

                <div className="course-module-field">

                  <label htmlFor="module-description">
                    Description
                  </label>

                  <textarea
                    id="module-description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Briefly describe what students will learn in this module."
                    maxLength={2000}
                  />

                </div>

                <div className="course-module-form-grid">

                  <div className="course-module-field">

                    <label htmlFor="module-order">
                      Display order
                    </label>

                    <input
                      id="module-order"
                      name="displayOrder"
                      type="number"
                      min="0"
                      value={
                        form.displayOrder
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <small>
                      Lower numbers
                      appear first.
                    </small>

                  </div>

                </div>

                <div className="course-module-options">

                  <label className="course-module-checkbox">

                    <input
                      type="checkbox"
                      name="published"
                      checked={
                        form.published
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      <strong>
                        Published
                      </strong>

                      <small>
                        Make this module
                        visible to
                        students when
                        access rules
                        allow it.
                      </small>
                    </span>

                  </label>

                  <label className="course-module-checkbox">

                    <input
                      type="checkbox"
                      name="isFree"
                      checked={
                        form.isFree
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      <strong>
                        Free preview
                      </strong>

                      <small>
                        Allow this
                        module to be
                        marked as free
                        content.
                      </small>
                    </span>

                  </label>

                </div>

                <footer className="course-module-form-footer">

                  <button
                    type="button"
                    className="course-module-secondary"
                    onClick={
                      closeForm
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="course-modules-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingModule
                        ? "Save Changes"
                        : "Create Module"}
                  </button>

                </footer>

              </form>

            </div>
          </div>
        )}

      </section>
    </AdminLayout>
  );
}

export default AdminCourseModules;
