import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import "./AdminMockQuestions.css";

const API_BASE_URL = import.meta.env.PROD
  ? "https://ojd-version.onrender.com/api"
  : "http://127.0.0.1:5000/api";

const createInitialForm = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctOption: 0,
  explanation: "",
  marks: 1,
  negativeMarks: 0,
  subject: "",
  topic: "",
  displayOrder: 0,
  active: true,
});

function AdminMockQuestions() {
  const { token } = useAuth();

  const mockTestId = window.location.pathname.match(
    /^\/admin\/mock-tests\/([^/]+)\/questions$/
  )?.[1];

  const [mockTest, setMockTest] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState(createInitialForm());

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const loadData = async () => {
    if (!token || !mockTestId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [testResponse, questionsResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/mock-tests/${mockTestId}`,
            { headers }
          ),
          fetch(
            `${API_BASE_URL}/mock-tests/${mockTestId}/questions`,
            { headers }
          ),
        ]);

      const testData = await testResponse.json();
      const questionsData =
        await questionsResponse.json();

      if (!testResponse.ok) {
        throw new Error(
          testData.message ||
            "Unable to load mock test."
        );
      }

      if (!questionsResponse.ok) {
        throw new Error(
          questionsData.message ||
            "Unable to load questions."
        );
      }

      setMockTest(testData.mockTest || null);
      setQuestions(
        Array.isArray(questionsData.questions)
          ? questionsData.questions
          : []
      );
    } catch (err) {
      console.error(
        "Admin mock questions load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load mock test questions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, mockTestId]);

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    setEditingQuestion(null);

    setForm({
      ...createInitialForm(),
      displayOrder: questions.length + 1,
    });

    setShowForm(true);
  };

  const openEditForm = (question) => {
    setError("");
    setSuccess("");
    setEditingQuestion(question);

    setForm({
      questionText: question.questionText || "",
      options:
        Array.isArray(question.options) &&
        question.options.length >= 2
          ? [...question.options]
          : ["", "", "", ""],
      correctOption:
        Number(question.correctOption) || 0,
      explanation: question.explanation || "",
      marks: question.marks ?? 1,
      negativeMarks:
        question.negativeMarks ?? 0,
      subject: question.subject || "",
      topic: question.topic || "",
      displayOrder:
        question.displayOrder ?? 0,
      active: Boolean(question.active),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingQuestion(null);
    setForm(createInitialForm());
  };

  const handleTextChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setForm((current) => ({
      ...current,
      options: current.options.map(
        (option, optionIndex) =>
          optionIndex === index
            ? value
            : option
      ),
    }));
  };

  const addOption = () => {
    if (form.options.length >= 6) return;

    setForm((current) => ({
      ...current,
      options: [...current.options, ""],
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;

    setForm((current) => {
      const nextOptions =
        current.options.filter(
          (_, optionIndex) =>
            optionIndex !== index
        );

      let nextCorrect =
        Number(current.correctOption) || 0;

      if (index === nextCorrect) {
        nextCorrect = 0;
      } else if (index < nextCorrect) {
        nextCorrect -= 1;
      }

      return {
        ...current,
        options: nextOptions,
        correctOption: nextCorrect,
      };
    });
  };

  const validateForm = () => {
    if (!form.questionText.trim()) {
      return "Question text is required.";
    }

    const options = form.options.map((option) =>
      option.trim()
    );

    if (
      options.length < 2 ||
      options.length > 6
    ) {
      return "A question must contain between 2 and 6 options.";
    }

    if (options.some((option) => !option)) {
      return "Every option must contain text.";
    }

    const correctOption =
      Number(form.correctOption);

    if (
      !Number.isInteger(correctOption) ||
      correctOption < 0 ||
      correctOption >= options.length
    ) {
      return "Please select a valid correct option.";
    }

    if (Number(form.marks) < 0) {
      return "Marks cannot be negative.";
    }

    if (Number(form.negativeMarks) < 0) {
      return "Negative marks cannot be negative.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        questionText:
          form.questionText.trim(),

        options: form.options.map(
          (option) => option.trim()
        ),

        correctOption:
          Number(form.correctOption),

        explanation:
          form.explanation.trim(),

        marks: Number(form.marks) || 0,

        negativeMarks:
          Number(form.negativeMarks) || 0,

        subject: form.subject.trim(),

        topic: form.topic.trim(),

        displayOrder:
          Number(form.displayOrder) || 0,

        active: Boolean(form.active),
      };

      const url = editingQuestion
        ? `${API_BASE_URL}/mock-tests/${mockTestId}/questions/${editingQuestion._id}`
        : `${API_BASE_URL}/mock-tests/${mockTestId}/questions`;

      const response = await fetch(url, {
        method: editingQuestion
          ? "PUT"
          : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save question."
        );
      }

      setSuccess(
        editingQuestion
          ? "Question updated successfully."
          : "Question created successfully."
      );

      setShowForm(false);
      setEditingQuestion(null);
      setForm(createInitialForm());

      await loadData();
    } catch (err) {
      console.error(
        "Mock question save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (question) => {
    const confirmed = window.confirm(
      "Delete this question permanently?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(question._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/mock-tests/${mockTestId}/questions/${question._id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete question."
        );
      }

      setSuccess(
        "Question deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Mock question delete error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete question."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (question) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/mock-tests/${mockTestId}/questions/${question._id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            active: !question.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update question status."
        );
      }

      setSuccess(
        question.active
          ? "Question deactivated."
          : "Question activated."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Mock question status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update question status."
      );
    }
  };

  const goBack = () => {
    window.location.assign(
      "/admin/mock-tests"
    );
  };

  if (!mockTestId) {
    return (
      <AdminLayout activePage="mock-tests">
        <main className="admin-mock-questions-page">
          <div className="admin-mock-questions-error">
            Invalid mock test URL.
          </div>
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="mock-tests">
      <main className="admin-mock-questions-page">
        <header className="admin-mock-questions-header">
          <div>
            <button
              type="button"
              className="admin-mock-questions-back"
              onClick={goBack}
            >
              ← Back to Mock Tests
            </button>

            <span className="admin-mock-questions-kicker">
              MOCK TEST QUESTIONS
            </span>

            <h1>
              {mockTest?.title ||
                "Mock Test Questions"}
            </h1>

            <p>
              Create, edit, organize and manage
              the questions for this mock test.
            </p>
          </div>

          <button
            type="button"
            className="admin-mock-questions-primary"
            onClick={openCreateForm}
          >
            + Add Question
          </button>
        </header>

        {error && (
          <div className="admin-mock-questions-alert admin-mock-questions-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-mock-questions-alert admin-mock-questions-alert-success">
            {success}
          </div>
        )}

        {mockTest && (
          <section className="admin-mock-questions-summary">
            <div>
              <span>Category</span>
              <strong>
                {mockTest.category || "—"}
              </strong>
            </div>

            <div>
              <span>Exam Type</span>
              <strong>
                {mockTest.examType || "—"}
              </strong>
            </div>

            <div>
              <span>Duration</span>
              <strong>
                {mockTest.durationMinutes || 0} min
              </strong>
            </div>

            <div>
              <span>Questions</span>
              <strong>
                {questions.length}
              </strong>
            </div>

            <div>
              <span>Marks</span>
              <strong>
                {mockTest.totalMarks || 0}
              </strong>
            </div>
          </section>
        )}

        {loading ? (
          <div className="admin-mock-questions-empty">
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <section className="admin-mock-questions-empty">
            <div className="admin-mock-questions-empty-icon">
              ?
            </div>

            <h2>No questions yet</h2>

            <p>
              Add the first question to this
              mock test.
            </p>

            <button
              type="button"
              className="admin-mock-questions-primary"
              onClick={openCreateForm}
            >
              + Add First Question
            </button>
          </section>
        ) : (
          <section className="admin-mock-question-list">
            {questions.map(
              (question, index) => (
                <article
                  className="admin-mock-question-card"
                  key={question._id}
                >
                  <div className="admin-mock-question-top">
                    <div className="admin-mock-question-number">
                      Q{index + 1}
                    </div>

                    <div className="admin-mock-question-meta">
                      <span>
                        {question.subject ||
                          "General"}
                      </span>

                      {question.topic && (
                        <span>
                          {question.topic}
                        </span>
                      )}

                      <span>
                        {question.marks ?? 0} marks
                      </span>

                      {question.negativeMarks >
                        0 && (
                        <span>
                          -{question.negativeMarks}
                        </span>
                      )}
                    </div>

                    <span
                      className={`admin-mock-question-status ${
                        question.active
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {question.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="admin-mock-question-content">
                    <h2>
                      {question.questionText}
                    </h2>

                    <div className="admin-mock-options">
                      {question.options?.map(
                        (option, optionIndex) => (
                          <div
                            className={`admin-mock-option ${
                              optionIndex ===
                              question.correctOption
                                ? "correct"
                                : ""
                            }`}
                            key={`${question._id}-${optionIndex}`}
                          >
                            <span>
                              {String.fromCharCode(
                                65 +
                                  optionIndex
                              )}
                            </span>

                            <p>{option}</p>

                            {optionIndex ===
                              question.correctOption && (
                              <strong>
                                Correct
                              </strong>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {question.explanation && (
                      <div className="admin-mock-explanation">
                        <strong>
                          Explanation
                        </strong>

                        <p>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="admin-mock-question-actions">
                    <button
                      type="button"
                      onClick={() =>
                        toggleActive(question)
                      }
                    >
                      {question.active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(question)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger"
                      disabled={
                        deletingId ===
                        question._id
                      }
                      onClick={() =>
                        deleteQuestion(question)
                      }
                    >
                      {deletingId ===
                      question._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              )
            )}
          </section>
        )}

        {showForm && (
          <div className="admin-mock-question-modal-backdrop">
            <div className="admin-mock-question-modal">
              <div className="admin-mock-question-modal-header">
                <div>
                  <span>
                    {editingQuestion
                      ? "EDIT QUESTION"
                      : "NEW QUESTION"}
                  </span>

                  <h2>
                    {editingQuestion
                      ? "Edit mock question"
                      : "Add mock question"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form
                className="admin-mock-question-form"
                onSubmit={handleSubmit}
              >
                <div className="admin-mock-question-field full">
                  <label>
                    Question
                  </label>

                  <textarea
                    name="questionText"
                    value={form.questionText}
                    onChange={handleTextChange}
                    rows={5}
                    placeholder="Enter the complete question..."
                    required
                  />
                </div>

                <div className="admin-mock-question-form-section">
                  <div className="admin-mock-question-section-heading">
                    <div>
                      <span>ANSWERS</span>
                      <h3>
                        Options
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={addOption}
                      disabled={
                        form.options.length >= 6
                      }
                    >
                      + Add option
                    </button>
                  </div>

                  <p className="admin-mock-question-help">
                    Select the radio button beside
                    the correct answer.
                  </p>

                  {form.options.map(
                    (option, index) => (
                      <div
                        className="admin-mock-option-input"
                        key={index}
                      >
                        <input
                          type="radio"
                          name="correctOption"
                          checked={
                            Number(
                              form.correctOption
                            ) === index
                          }
                          onChange={() =>
                            setForm(
                              (current) => ({
                                ...current,
                                correctOption:
                                  index,
                              })
                            )
                          }
                          aria-label={`Mark option ${
                            index + 1
                          } correct`}
                        />

                        <span>
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            handleOptionChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Option ${String.fromCharCode(
                            65 + index
                          )}`}
                          required
                        />

                        {form.options.length >
                          2 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeOption(index)
                            }
                            aria-label={`Remove option ${
                              index + 1
                            }`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="admin-mock-question-grid">
                  <div className="admin-mock-question-field">
                    <label>Subject</label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleTextChange}
                      placeholder="e.g. Polity"
                    />
                  </div>

                  <div className="admin-mock-question-field">
                    <label>Topic</label>
                    <input
                      name="topic"
                      value={form.topic}
                      onChange={handleTextChange}
                      placeholder="e.g. Fundamental Rights"
                    />
                  </div>

                  <div className="admin-mock-question-field">
                    <label>Marks</label>
                    <input
                      name="marks"
                      type="number"
                      min="0"
                      step="0.25"
                      value={form.marks}
                      onChange={handleTextChange}
                    />
                  </div>

                  <div className="admin-mock-question-field">
                    <label>Negative marks</label>
                    <input
                      name="negativeMarks"
                      type="number"
                      min="0"
                      step="0.25"
                      value={form.negativeMarks}
                      onChange={handleTextChange}
                    />
                  </div>

                  <div className="admin-mock-question-field">
                    <label>Display order</label>
                    <input
                      name="displayOrder"
                      type="number"
                      min="0"
                      value={form.displayOrder}
                      onChange={handleTextChange}
                    />
                  </div>

                  <label className="admin-mock-question-toggle">
                    <input
                      name="active"
                      type="checkbox"
                      checked={form.active}
                      onChange={handleTextChange}
                    />
                    <span>
                      Active question
                    </span>
                  </label>
                </div>

                <div className="admin-mock-question-field full">
                  <label>
                    Explanation
                  </label>

                  <textarea
                    name="explanation"
                    value={form.explanation}
                    onChange={handleTextChange}
                    rows={4}
                    placeholder="Optional explanation shown after submission..."
                  />
                </div>

                <div className="admin-mock-question-form-actions">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingQuestion
                        ? "Save Changes"
                        : "Create Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}

export default AdminMockQuestions;
