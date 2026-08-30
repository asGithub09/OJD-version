import { useEffect, useState } from "react";

import AdminLayout from "./AdminLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";

import "./AdminCourses.css";

const API_BASE_URL = "http://localhost:5000/api";

const initialForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  thumbnailUrl: "",
  faculty: [],
  level: "ALL_LEVELS",
  duration: "",
  price: 0,
  originalPrice: 0,
  featured: false,
  published: false,
  displayOrder: 0,
};

function AdminCourses() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [form, setForm] = useState(initialForm);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/courses/admin`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load courses."
        );
      }

      setCourses(data.courses || []);
    } catch (err) {
      console.error("Courses load error:", err);

      setError(
        err.message || "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFaculty = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/faculty/admin`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFaculty(data.faculty || []);
      }
    } catch (err) {
      console.error("Faculty load error:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    loadCourses();
    loadFaculty();
  }, [token]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingCourse(null);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");

    resetForm();
    setShowForm(true);
  };

  const openEditForm = (course) => {
    setError("");
    setSuccess("");

    setEditingCourse(course);

    setForm({
      title: course.title || "",
      slug: course.slug || "",
      shortDescription:
        course.shortDescription || "",
      description: course.description || "",
      category: course.category || "",
      thumbnailUrl: course.thumbnailUrl || "",
      faculty: Array.isArray(course.faculty)
        ? course.faculty.map((item) =>
            typeof item === "string"
              ? item
              : item._id
          )
        : [],
      level: course.level || "ALL_LEVELS",
      duration: course.duration || "",
      price: course.price ?? 0,
      originalPrice:
        course.originalPrice ?? 0,
      featured: Boolean(course.featured),
      published: Boolean(course.published),
      displayOrder:
        course.displayOrder ?? 0,
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
      options,
    } = event.target;

    if (name === "faculty") {
      const selected = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      setForm((current) => ({
        ...current,
        faculty: selected,
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Course title is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Course slug is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Course category is required.");
      return;
    }

    const price = Number(form.price) || 0;
    const originalPrice =
      Number(form.originalPrice) || 0;

    if (
      originalPrice > 0 &&
      price > originalPrice
    ) {
      setError(
        "Course price cannot exceed original price."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        shortDescription:
          form.shortDescription.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        thumbnailUrl:
          form.thumbnailUrl.trim(),
        faculty: form.faculty,
        level: form.level,
        duration: form.duration.trim(),
        price,
        originalPrice,
        featured: Boolean(form.featured),
        published: Boolean(form.published),
        displayOrder:
          Number(form.displayOrder) || 0,
      };

      const url = editingCourse
        ? `${API_BASE_URL}/courses/${editingCourse._id}`
        : `${API_BASE_URL}/courses`;

      const method = editingCourse
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save course."
        );
      }

      setSuccess(
        editingCourse
          ? "Course updated successfully."
          : "Course created successfully."
      );

      setShowForm(false);
      resetForm();

      await loadCourses();
    } catch (err) {
      console.error("Course save error:", err);

      setError(
        err.message || "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/courses/${course._id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete course."
        );
      }

      setSuccess("Course deleted successfully.");

      await loadCourses();
    } catch (err) {
      console.error("Course delete error:", err);

      setError(
        err.message ||
          "Unable to delete course."
      );
    }
  };

  const toggleFeatured = async (course) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/courses/${course._id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            featured: !course.featured,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update featured status."
        );
      }

      setSuccess(
        !course.featured
          ? "Course marked as featured."
          : "Course removed from featured."
      );

      await loadCourses();
    } catch (err) {
      console.error(
        "Featured update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update featured status."
      );
    }
  };

  const togglePublished = async (course) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/courses/${course._id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            published: !course.published,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update course status."
        );
      }

      setSuccess(
        !course.published
          ? "Course published."
          : "Course moved to draft."
      );

      await loadCourses();
    } catch (err) {
      console.error(
        "Published update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update course status."
      );
    }
  };

  const totalCourses = courses.length;

  const publishedCourses = courses.filter(
    (course) => course.published
  ).length;

  const draftCourses = courses.filter(
    (course) => !course.published
  ).length;

  const featuredCourses = courses.filter(
    (course) => course.featured
  ).length;

  return (
    <AdminLayout activePage="courses">
      <section className="courses-page">

        <div className="courses-page-header">
          <div>
            <span className="admin-section-kicker">
              COURSE MANAGEMENT
            </span>

            <h2>
              Courses
              <span>.</span>
            </h2>

            <p>
              Create, manage and publish
              courses for OJDV students.
            </p>
          </div>

          <button
            type="button"
            className="courses-primary-button"
            onClick={openCreateForm}
          >
            <span>+</span>
            Create Course
          </button>
        </div>

        {error && (
          <div className="courses-alert courses-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="courses-alert courses-alert-success">
            {success}
          </div>
        )}

        <section className="courses-stats-grid">

          <article className="courses-stat-card">
            <span>Total Courses</span>
            <strong>{totalCourses}</strong>
          </article>

          <article className="courses-stat-card">
            <span>Published</span>
            <strong>{publishedCourses}</strong>
          </article>

          <article className="courses-stat-card">
            <span>Drafts</span>
            <strong>{draftCourses}</strong>
          </article>

          <article className="courses-stat-card">
            <span>Featured</span>
            <strong>{featuredCourses}</strong>
          </article>

        </section>

        <section className="courses-panel">

          <div className="courses-panel-header">
            <div>
              <span className="courses-panel-kicker">
                OJDV CATALOG
              </span>

              <h3>All Courses</h3>
            </div>

            <button
              type="button"
              className="courses-refresh-button"
              onClick={loadCourses}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="courses-empty-state">

              <div className="courses-loader" />

              <p>
                Loading courses...
              </p>

            </div>
          ) : courses.length === 0 ? (
            <div className="courses-empty-state">

              <div className="courses-empty-icon">
                +
              </div>

              <h3>No courses yet</h3>

              <p>
                Create your first course to start
                building the OJDV learning catalog.
              </p>

              <button
                type="button"
                className="courses-primary-button"
                onClick={openCreateForm}
              >
                <span>+</span>
                Create First Course
              </button>

            </div>
          ) : (
            <div className="courses-table-wrapper">

              <table className="courses-table">

                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {courses.map((course) => (
                    <tr key={course._id}>

                      <td>
                        <div className="course-table-title">

                          {course.thumbnailUrl ? (
                            <img
                              src={
                                course.thumbnailUrl
                              }
                              alt=""
                            />
                          ) : (
                            <div className="course-table-placeholder">
                              {course.title
                                ?.charAt(0)
                                .toUpperCase() ||
                                "C"}
                            </div>
                          )}

                          <div>
                            <strong>
                              {course.title}
                            </strong>

                            <span>
                              /{course.slug}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        {course.category || "—"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          course.price || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`course-status ${
                            course.published
                              ? "course-status-published"
                              : "course-status-draft"
                          }`}
                          onClick={() =>
                            togglePublished(course)
                          }
                          title="Toggle publication status"
                        >
                          <span />
                          {course.published
                            ? "Published"
                            : "Draft"}
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`course-featured ${
                            course.featured
                              ? "course-featured-active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleFeatured(course)
                          }
                        >
                          {course.featured
                            ? "Featured"
                            : "Not featured"}
                        </button>
                      </td>

                      <td>
                        <div className="course-actions">

                          <button
                            type="button"
                            className="course-content-button"
                            onClick={() =>
                              window.location.href =
                                `/admin/courses/${course._id}/modules`
                            }
                          >
                            Content
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(course)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="course-delete-button"
                            onClick={() =>
                              handleDelete(course)
                            }
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {showForm && (
          <div
            className="course-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeForm();
              }
            }}
          >

            <div className="course-modal">

              <header className="course-modal-header">

                <div>
                  <span className="courses-panel-kicker">
                    {editingCourse
                      ? "EDIT COURSE"
                      : "NEW COURSE"}
                  </span>

                  <h3>
                    {editingCourse
                      ? "Edit course"
                      : "Create course"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="course-modal-close"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close"
                >
                  ×
                </button>

              </header>

              <form
                className="course-form"
                onSubmit={handleSubmit}
              >

                <div className="course-form-grid">

                  <div className="course-field">
                    <label htmlFor="course-title">
                      Course title
                    </label>

                    <input
                      id="course-title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. UPSC Civil Services"
                      required
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-slug">
                      Slug
                    </label>

                    <input
                      id="course-slug"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="upsc-civil-services"
                      required
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-category">
                      Category
                    </label>

                    <input
                      id="course-category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="Civil Services"
                      required
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-level">
                      Level
                    </label>

                    <select
                      id="course-level"
                      name="level"
                      value={form.level}
                      onChange={handleChange}
                    >
                      <option value="BEGINNER">
                        Beginner
                      </option>

                      <option value="INTERMEDIATE">
                        Intermediate
                      </option>

                      <option value="ADVANCED">
                        Advanced
                      </option>

                      <option value="ALL_LEVELS">
                        All Levels
                      </option>
                    </select>
                  </div>

                  <div className="course-field course-field-full">
                    <label htmlFor="course-short-description">
                      Short description
                    </label>

                    <input
                      id="course-short-description"
                      name="shortDescription"
                      value={
                        form.shortDescription
                      }
                      onChange={handleChange}
                      placeholder="Short course summary"
                    />
                  </div>

                  <div className="course-field course-field-full">
                    <label htmlFor="course-description">
                      Description
                    </label>

                    <textarea
                      id="course-description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the course..."
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-duration">
                      Duration
                    </label>

                    <input
                      id="course-duration"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="6 Months"
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-thumbnail">
                      Thumbnail URL
                    </label>

                    <input
                      id="course-thumbnail"
                      name="thumbnailUrl"
                      value={form.thumbnailUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-price">
                      Price
                    </label>

                    <input
                      id="course-price"
                      name="price"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-original-price">
                      Original price
                    </label>

                    <input
                      id="course-original-price"
                      name="originalPrice"
                      type="number"
                      min="0"
                      value={
                        form.originalPrice
                      }
                      onChange={handleChange}
                    />
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-order">
                      Display order
                    </label>

                    <input
                      id="course-order"
                      name="displayOrder"
                      type="number"
                      min="0"
                      value={
                        form.displayOrder
                      }
                      onChange={handleChange}
                    />

                    <small>
                      Lower numbers appear first.
                    </small>
                  </div>

                  <div className="course-field course-field-full">
                    <label htmlFor="course-faculty">
                      Faculty
                    </label>

                    <select
                      id="course-faculty"
                      name="faculty"
                      multiple
                      value={form.faculty}
                      onChange={handleChange}
                    >
                      {faculty.length === 0 ? (
                        <option disabled>
                          No faculty available
                        </option>
                      ) : (
                        faculty.map((member) => (
                          <option
                            key={member._id}
                            value={member._id}
                          >
                            {member.name}
                          </option>
                        ))
                      )}
                    </select>

                    <small>
                      Hold Ctrl while clicking to
                      select multiple faculty members.
                    </small>
                  </div>

                  <div className="course-field course-field-full">

                    <div className="course-checkbox-row">

                      <label className="course-checkbox">
                        <input
                          type="checkbox"
                          name="published"
                          checked={
                            form.published
                          }
                          onChange={handleChange}
                        />

                        <span>
                          Published
                        </span>
                      </label>

                      <label className="course-checkbox">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={
                            form.featured
                          }
                          onChange={handleChange}
                        />

                        <span>
                          Featured
                        </span>
                      </label>

                    </div>

                  </div>

                </div>

                <footer className="course-form-footer">

                  <button
                    type="button"
                    className="course-secondary-button"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="courses-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCourse
                      ? "Save Changes"
                      : "Create Course"}
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

export default AdminCourses;