import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import "./AdminMockTests.css";

const API_BASE_URL = import.meta.env.PROD
  ? "https://ojd-version.onrender.com/api"
  : "http://127.0.0.1:5000/api";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  category: "",
  examType: "",
  thumbnailUrl: "",
  durationMinutes: 60,
  questionCount: 0,
  totalMarks: 0,
  passingMarks: 0,
  price: 0,
  originalPrice: 0,
  featured: false,
  published: false,
  displayOrder: 0,
};

function AdminMockTests() {
  const { token } = useAuth();

  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMockTest, setEditingMockTest] = useState(null);
  const [form, setForm] = useState(initialForm);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadMockTests = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/mock-tests/admin`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load mock tests."
        );
      }

      setMockTests(data.mockTests || []);
    } catch (err) {
      console.error("Mock tests load error:", err);

      setError(
        err.message || "Unable to load mock tests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMockTests();
  }, [token]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingMockTest(null);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (mockTest) => {
    setError("");
    setSuccess("");

    setEditingMockTest(mockTest);

    setForm({
      title: mockTest.title || "",
      slug: mockTest.slug || "",
      description: mockTest.description || "",
      category: mockTest.category || "",
      examType: mockTest.examType || "",
      thumbnailUrl: mockTest.thumbnailUrl || "",
      durationMinutes:
        mockTest.durationMinutes ?? 60,
      questionCount:
        mockTest.questionCount ?? 0,
      totalMarks:
        mockTest.totalMarks ?? 0,
      passingMarks:
        mockTest.passingMarks ?? 0,
      price: mockTest.price ?? 0,
      originalPrice:
        mockTest.originalPrice ?? 0,
      featured: Boolean(mockTest.featured),
      published: Boolean(mockTest.published),
      displayOrder:
        mockTest.displayOrder ?? 0,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Mock test title is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Mock test slug is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Mock test category is required.");
      return;
    }

    const durationMinutes =
      Number(form.durationMinutes) || 0;

    const questionCount =
      Number(form.questionCount) || 0;

    const totalMarks =
      Number(form.totalMarks) || 0;

    const passingMarks =
      Number(form.passingMarks) || 0;

    const price =
      Number(form.price) || 0;

    const originalPrice =
      Number(form.originalPrice) || 0;

    if (durationMinutes < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    if (passingMarks > totalMarks) {
      setError(
        "Passing marks cannot exceed total marks."
      );
      return;
    }

    if (
      originalPrice > 0 &&
      price > originalPrice
    ) {
      setError(
        "Price cannot exceed original price."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        category: form.category.trim(),
        examType: form.examType.trim(),
        thumbnailUrl:
          form.thumbnailUrl.trim(),
        durationMinutes,
        questionCount,
        totalMarks,
        passingMarks,
        price,
        originalPrice,
        featured: Boolean(form.featured),
        published: Boolean(form.published),
        displayOrder:
          Number(form.displayOrder) || 0,
      };

      const url = editingMockTest
        ? `${API_BASE_URL}/mock-tests/${editingMockTest._id}`
        : `${API_BASE_URL}/mock-tests`;

      const method = editingMockTest
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
            "Unable to save mock test."
        );
      }

      setSuccess(
        editingMockTest
          ? "Mock test updated successfully."
          : "Mock test created successfully."
      );

      setShowForm(false);
      resetForm();

      await loadMockTests();
    } catch (err) {
      console.error(
        "Mock test save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save mock test."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mockTest) => {
    const confirmed = window.confirm(
      `Delete "${mockTest.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/mock-tests/${mockTest._id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete mock test."
        );
      }

      setSuccess(
        "Mock test deleted successfully."
      );

      await loadMockTests();
    } catch (err) {
      console.error(
        "Mock test delete error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete mock test."
      );
    }
  };

  const togglePublished = async (mockTest) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/mock-tests/${mockTest._id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            published: !mockTest.published,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update publication status."
        );
      }

      setSuccess(
        !mockTest.published
          ? "Mock test published."
          : "Mock test moved to draft."
      );

      await loadMockTests();
    } catch (err) {
      console.error(
        "Mock test publication error:",
        err
      );

      setError(
        err.message ||
          "Unable to update publication status."
      );
    }
  };

  const toggleFeatured = async (mockTest) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/mock-tests/${mockTest._id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            featured: !mockTest.featured,
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
        !mockTest.featured
          ? "Mock test marked as featured."
          : "Mock test removed from featured."
      );

      await loadMockTests();
    } catch (err) {
      console.error(
        "Mock test featured error:",
        err
      );

      setError(
        err.message ||
          "Unable to update featured status."
      );
    }
  };

  const totalTests = mockTests.length;

  const publishedTests =
    mockTests.filter(
      (test) => test.published
    ).length;

  const draftTests =
    mockTests.filter(
      (test) => !test.published
    ).length;

  const featuredTests =
    mockTests.filter(
      (test) => test.featured
    ).length;

  return (
    <AdminLayout activePage="mock-tests">
      <section className="admin-mock-tests-page">

        <div className="admin-mock-tests-header">
          <div>
            <span className="admin-section-kicker">
              MOCK TEST MANAGEMENT
            </span>

            <h2>
              Mock Tests
              <span>.</span>
            </h2>

            <p>
              Create, manage and publish
              exam-style assessments for
              OJDV students.
            </p>
          </div>

          <button
            type="button"
            className="admin-mock-primary-button"
            onClick={openCreateForm}
          >
            <span>+</span>
            Create Mock Test
          </button>
        </div>

        {error && (
          <div className="admin-mock-alert admin-mock-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-mock-alert admin-mock-alert-success">
            {success}
          </div>
        )}

        <section className="admin-mock-stats-grid">
          <article className="admin-mock-stat-card">
            <span>Total Tests</span>
            <strong>{totalTests}</strong>
          </article>

          <article className="admin-mock-stat-card">
            <span>Published</span>
            <strong>{publishedTests}</strong>
          </article>

          <article className="admin-mock-stat-card">
            <span>Drafts</span>
            <strong>{draftTests}</strong>
          </article>

          <article className="admin-mock-stat-card">
            <span>Featured</span>
            <strong>{featuredTests}</strong>
          </article>
        </section>

        <section className="admin-mock-panel">
          <div className="admin-mock-panel-header">
            <div>
              <span className="admin-mock-panel-kicker">
                OJDV ASSESSMENT CATALOG
              </span>

              <h3>All Mock Tests</h3>
            </div>

            <button
              type="button"
              className="admin-mock-refresh-button"
              onClick={loadMockTests}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="admin-mock-empty">
              <div className="admin-mock-loader" />
              <p>Loading mock tests...</p>
            </div>
          ) : mockTests.length === 0 ? (
            <div className="admin-mock-empty">
              <div className="admin-mock-empty-icon">
                ✓
              </div>

              <h3>No mock tests yet</h3>

              <p>
                Create your first mock test
                to start building the OJDV
                assessment catalog.
              </p>

              <button
                type="button"
                className="admin-mock-primary-button"
                onClick={openCreateForm}
              >
                <span>+</span>
                Create First Mock Test
              </button>
            </div>
          ) : (
            <div className="admin-mock-table-wrapper">
              <table className="admin-mock-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Questions</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {mockTests.map((mockTest) => (
                    <tr key={mockTest._id}>
                      <td>
                        <div className="admin-mock-title">
                          {mockTest.thumbnailUrl ? (
                            <img
                              src={mockTest.thumbnailUrl}
                              alt=""
                            />
                          ) : (
                            <div className="admin-mock-placeholder">
                              {mockTest.title
                                ?.charAt(0)
                                .toUpperCase() || "M"}
                            </div>
                          )}

                          <div>
                            <strong>
                              {mockTest.title}
                            </strong>

                            <span>
                              /{mockTest.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {mockTest.category || "—"}
                      </td>

                      <td>
                        {mockTest.durationMinutes || 0} min
                      </td>

                      <td>
                        {mockTest.questionCount || 0}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`admin-mock-status ${
                            mockTest.published
                              ? "admin-mock-status-published"
                              : "admin-mock-status-draft"
                          }`}
                          onClick={() =>
                            togglePublished(mockTest)
                          }
                        >
                          <span />
                          {mockTest.published
                            ? "Published"
                            : "Draft"}
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`admin-mock-featured ${
                            mockTest.featured
                              ? "admin-mock-featured-active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleFeatured(mockTest)
                          }
                        >
                          {mockTest.featured
                            ? "Featured"
                            : "Not featured"}
                        </button>
                      </td>

                      <td>
                        <div className="admin-mock-actions">
                          <button
                            type="button"
                            className="admin-mock-content-button"
                            onClick={() =>
                              window.location.href =
                                `/admin/mock-tests/${mockTest._id}/questions`
                            }
                          >
                            Questions
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(mockTest)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-mock-delete-button"
                            onClick={() =>
                              handleDelete(mockTest)
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
            className="admin-mock-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeForm();
              }
            }}
          >
            <div className="admin-mock-modal">
              <header className="admin-mock-modal-header">
                <div>
                  <span className="admin-mock-panel-kicker">
                    {editingMockTest
                      ? "EDIT MOCK TEST"
                      : "NEW MOCK TEST"}
                  </span>

                  <h3>
                    {editingMockTest
                      ? "Edit mock test"
                      : "Create mock test"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="admin-mock-modal-close"
                  onClick={closeForm}
                  disabled={saving}
                >
                  ×
                </button>
              </header>

              <form
                className="admin-mock-form"
                onSubmit={handleSubmit}
              >
                <div className="admin-mock-form-grid">

                  <div className="admin-mock-field">
                    <label>
                      Test title
                    </label>

                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. UPSC GS Paper I Mock Test 01"
                      required
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Slug
                    </label>

                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="upsc-gs-paper-1-mock-01"
                      required
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Category
                    </label>

                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="General Studies"
                      required
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Exam type
                    </label>

                    <input
                      name="examType"
                      value={form.examType}
                      onChange={handleChange}
                      placeholder="UPSC CSE"
                    />
                  </div>

                  <div className="admin-mock-field admin-mock-field-full">
                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe this mock test..."
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Duration (minutes)
                    </label>

                    <input
                      name="durationMinutes"
                      type="number"
                      min="1"
                      value={form.durationMinutes}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Question count
                    </label>

                    <input
                      name="questionCount"
                      type="number"
                      min="0"
                      value={form.questionCount}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Total marks
                    </label>

                    <input
                      name="totalMarks"
                      type="number"
                      min="0"
                      value={form.totalMarks}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Passing marks
                    </label>

                    <input
                      name="passingMarks"
                      type="number"
                      min="0"
                      value={form.passingMarks}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Price
                    </label>

                    <input
                      name="price"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Original price
                    </label>

                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      value={form.originalPrice}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Display order
                    </label>

                    <input
                      name="displayOrder"
                      type="number"
                      min="0"
                      value={form.displayOrder}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-mock-field">
                    <label>
                      Thumbnail URL
                    </label>

                    <input
                      name="thumbnailUrl"
                      value={form.thumbnailUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-mock-field admin-mock-field-full">
                    <div className="admin-mock-checkbox-row">
                      <label>
                        <input
                          type="checkbox"
                          name="published"
                          checked={form.published}
                          onChange={handleChange}
                        />
                        Published
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          name="featured"
                          checked={form.featured}
                          onChange={handleChange}
                        />
                        Featured
                      </label>
                    </div>
                  </div>
                </div>

                <footer className="admin-mock-form-footer">
                  <button
                    type="button"
                    className="admin-mock-secondary-button"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-mock-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingMockTest
                      ? "Save Changes"
                      : "Create Mock Test"}
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

export default AdminMockTests;
