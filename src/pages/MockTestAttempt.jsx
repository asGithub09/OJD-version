import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import "./MockTestAttempt.css";

const API_BASE_URL =
  import.meta.env.PROD
    ? "https://ojd-version.onrender.com/api"
    : "http://127.0.0.1:5000/api";

const formatTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const getQuestionId = (question) =>
  String(question?._id || question?.id || "");

const buildAnswerMap = (answers = []) => {
  const map = {};

  if (!Array.isArray(answers)) {
    return map;
  }

  answers.forEach((answer) => {
    if (!answer?.question) {
      return;
    }

    map[String(answer.question)] = {
      selectedOption:
        answer.selectedOption === null ||
        answer.selectedOption === undefined
          ? null
          : Number(answer.selectedOption),
      markedForReview: Boolean(answer.markedForReview),
      answeredAt: answer.answeredAt || null,
    };
  });

  return map;
};

function MockTestAttempt() {
  const { token, user } = useAuth();

  const [mockTest, setMockTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedResult, setSubmittedResult] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const mockTestId = useMemo(() => {
    const match = window.location.pathname.match(
      /^\/mock-test\/([^/]+)/
    );

    return match ? match[1] : "";
  }, []);

  const currentQuestion =
    questions[currentIndex] || null;

  const currentQuestionId =
    getQuestionId(currentQuestion);

  const currentAnswer =
    answers[currentQuestionId] || {
      selectedOption: null,
      markedForReview: false,
    };

  const answeredCount = useMemo(
    () =>
      questions.filter((question) => {
        const answer =
          answers[getQuestionId(question)];

        return (
          answer &&
          Number.isInteger(
            Number(answer.selectedOption)
          )
        );
      }).length,
    [answers, questions]
  );

  const reviewCount = useMemo(
    () =>
      questions.filter(
        (question) =>
          answers[getQuestionId(question)]
            ?.markedForReview
      ).length,
    [answers, questions]
  );

  const unansweredCount =
    questions.length - answeredCount;

  const remainingSeconds = useMemo(() => {
    const duration =
      Number(mockTest?.durationMinutes) || 0;

    return Math.max(
      0,
      duration * 60 - elapsedSeconds
    );
  }, [
    mockTest,
    elapsedSeconds,
  ]);

  const apiFetch = useCallback(
    async (url, options = {}) => {
      const response = await fetch(
        `${API_BASE_URL}${url}`,
        {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
            ...(options.headers || {}),
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Something went wrong."
        );
      }

      return data;
    },
    [token]
  );

  const saveProgress = useCallback(
    async (nextAnswers = answers, nextElapsed = elapsedSeconds) => {
      if (!attempt?._id || submitting) {
        return;
      }

      setSaving(true);

      try {
        const payloadAnswers =
          questions.map((question) => {
            const questionId =
              getQuestionId(question);

            const answer =
              nextAnswers[questionId];

            return {
              question: questionId,
              selectedOption:
                answer?.selectedOption ??
                null,
              markedForReview:
                Boolean(
                  answer?.markedForReview
                ),
              answeredAt:
                answer?.answeredAt ||
                null,
            };
          });

        await apiFetch(
          `/mock-test-attempts/${attempt._id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              answers: payloadAnswers,
              timeTakenSeconds:
                Math.max(
                  0,
                  Math.floor(
                    Number(nextElapsed) || 0
                  )
                ),
            }),
          }
        );
      } catch (err) {
        console.error(
          "Mock test autosave error:",
          err
        );
      } finally {
        setSaving(false);
      }
    },
    [
      apiFetch,
      answers,
      attempt,
      elapsedSeconds,
      questions,
      submitting,
    ]
  );

  const submitTest = useCallback(
    async (automatic = false) => {
      if (!attempt?._id || submitting) {
        return;
      }

      setSubmitting(true);
      setError("");
      setShowSubmitConfirm(false);

      try {
        const payloadAnswers =
          questions.map((question) => {
            const questionId =
              getQuestionId(question);

            const answer =
              answers[questionId];

            return {
              question: questionId,
              selectedOption:
                answer?.selectedOption ??
                null,
              markedForReview:
                Boolean(
                  answer?.markedForReview
                ),
              answeredAt:
                answer?.answeredAt ||
                null,
            };
          });

        const data = await apiFetch(
          `/mock-test-attempts/${attempt._id}/submit`,
          {
            method: "POST",
            body: JSON.stringify({
              answers: payloadAnswers,
              timeTakenSeconds:
                Math.min(
                  elapsedSeconds,
                  Number(
                    mockTest?.durationMinutes
                  ) * 60
                ),
            }),
          }
        );

        setSubmittedResult({
          ...data,
          automatic,
        });
      } catch (err) {
        console.error(
          "Mock test submission error:",
          err
        );

        setError(
          err.message ||
            "Unable to submit the test."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      apiFetch,
      answers,
      attempt,
      elapsedSeconds,
      mockTest,
      questions,
      submitting,
    ]
  );

  useEffect(() => {
    if (!token || !user) {
      window.location.href = "/";
      return;
    }

    if (!mockTestId) {
      setError(
        "Mock test could not be identified."
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function startTest() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch(
          `/mock-test-attempts/start/${mockTestId}`,
          {
            method: "POST",
          }
        );

        if (cancelled) {
          return;
        }

        setMockTest(data.mockTest || null);

        const nextQuestions =
          Array.isArray(data.questions)
            ? data.questions
            : [];

        setQuestions(nextQuestions);

        setAttempt(data.attempt || null);

        setAnswers(
          buildAnswerMap(
            data.attempt?.answers
          )
        );

        const startedAt = data.attempt?.startedAt
          ? new Date(
              data.attempt.startedAt
            ).getTime()
          : Date.now();

        const durationSeconds =
          Number(
            data.mockTest?.durationMinutes
          ) * 60;

        const calculatedElapsed =
          Math.max(
            0,
            Math.floor(
              (Date.now() - startedAt) /
                1000
            )
          );

        const existingElapsed =
          Number(
            data.attempt?.timeTakenSeconds
          ) || 0;

        setElapsedSeconds(
          Math.min(
            durationSeconds,
            Math.max(
              existingElapsed,
              calculatedElapsed
            )
          )
        );
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Mock test start error:",
            err
          );

          setError(
            err.message ||
              "Unable to start this mock test."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    startTest();

    return () => {
      cancelled = true;
    };
  }, [
    apiFetch,
    mockTestId,
    token,
    user,
  ]);

  useEffect(() => {
    if (
      loading ||
      !attempt ||
      submittedResult ||
      submitting
    ) {
      return undefined;
    }

    if (
      remainingSeconds <= 0
    ) {
      submitTest(true);
      return undefined;
    }

    const timer = window.setInterval(
      () => {
        setElapsedSeconds(
          (previous) =>
            previous + 1
        );
      },
      1000
    );

    return () =>
      window.clearInterval(timer);
  }, [
    attempt,
    loading,
    remainingSeconds,
    submitTest,
    submittedResult,
    submitting,
  ]);

  useEffect(() => {
    if (
      loading ||
      !attempt ||
      submittedResult ||
      submitting
    ) {
      return undefined;
    }

    const interval =
      window.setInterval(() => {
        saveProgress();
      }, 15000);

    return () =>
      window.clearInterval(interval);
  }, [
    attempt,
    loading,
    saveProgress,
    submittedResult,
    submitting,
  ]);

  useEffect(() => {
    if (
      loading ||
      !attempt ||
      submittedResult ||
      submitting
    ) {
      return;
    }

    const handleBeforeUnload = () => {
      const payloadAnswers =
        questions.map((question) => {
          const questionId =
            getQuestionId(question);

          const answer =
            answers[questionId];

          return {
            question: questionId,
            selectedOption:
              answer?.selectedOption ??
              null,
            markedForReview:
              Boolean(
                answer?.markedForReview
              ),
            answeredAt:
              answer?.answeredAt ||
              null,
          };
        });

      const body = JSON.stringify({
        answers: payloadAnswers,
        timeTakenSeconds:
          elapsedSeconds,
      });

      const url =
        `${API_BASE_URL}/mock-test-attempts/${attempt._id}`;

      if (
        navigator.sendBeacon
      ) {
        const blob = new Blob(
          [body],
          {
            type:
              "application/json",
          }
        );

        navigator.sendBeacon(
          url,
          blob
        );
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () =>
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
  }, [
    answers,
    attempt,
    elapsedSeconds,
    loading,
    questions,
    submittedResult,
    submitting,
  ]);

  const updateAnswer = (
    selectedOption
  ) => {
    if (!currentQuestionId) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestionId]: {
        ...currentAnswer,
        selectedOption:
          Number(selectedOption),
        answeredAt:
          new Date().toISOString(),
      },
    };

    setAnswers(nextAnswers);
  };

  const toggleReview = () => {
    if (!currentQuestionId) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestionId]: {
        ...currentAnswer,
        markedForReview:
          !currentAnswer.markedForReview,
      },
    };

    setAnswers(nextAnswers);
  };

  const goToQuestion = (index) => {
    if (
      index >= 0 &&
      index < questions.length
    ) {
      setCurrentIndex(index);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <main className="mock-attempt-page">
        <div className="mock-attempt-loading">
          <div className="attempt-loader" />
          <h2>Preparing your test...</h2>
          <p>
            Loading questions and restoring
            your progress.
          </p>
        </div>
      </main>
    );
  }

  if (submittedResult) {
    const result =
      submittedResult.attempt || {};

    const gamification =
      submittedResult.gamification || {};

    const passed =
      Number(result.score || 0) >=
      Number(
        submittedResult.mockTest
          ?.passingMarks || 0
      );

    return (
      <main className="mock-result-page">
        <section className="mock-result-card">
          <div className="result-success-icon">
            ✓
          </div>

          <span className="result-eyebrow">
            {submittedResult.automatic
              ? "TIME UP"
              : "TEST SUBMITTED"}
          </span>

          <h1>
            {passed
              ? "Excellent work!"
              : "Test completed"}
          </h1>

          <p className="result-subtitle">
            {mockTest?.title ||
              "Mock Test"}
          </p>

          <div className="result-score">
            <strong>
              {Number(
                result.percentage || 0
              ).toFixed(1)}
              %
            </strong>
            <span>
              Overall Score
            </span>
          </div>

          <div className="result-grid">
            <div>
              <strong>
                {result.correctAnswers || 0}
              </strong>
              <span>Correct</span>
            </div>

            <div>
              <strong>
                {result.incorrectAnswers || 0}
              </strong>
              <span>Incorrect</span>
            </div>

            <div>
              <strong>
                {result.unanswered || 0}
              </strong>
              <span>Unanswered</span>
            </div>

            <div>
              <strong>
                {Number(
                  result.accuracy || 0
                ).toFixed(1)}
                %
              </strong>
              <span>Accuracy</span>
            </div>
          </div>

          <div className="result-rewards">
            <div className="reward-card">
              <span>XP EARNED</span>
              <strong>
                +{result.xpEarned || 0}
              </strong>
            </div>

            <div className="reward-card">
              <span>CURRENT STREAK</span>
              <strong>
                {gamification.currentStreak ||
                  0}
                {" "}
                days
              </strong>
            </div>

            <div className="reward-card">
              <span>TOTAL XP</span>
              <strong>
                {gamification.totalXP || 0}
              </strong>
            </div>
          </div>

          <div className="result-actions">
            <button
              type="button"
              className="result-primary"
              onClick={() => {
                window.location.href =
                  "/mock-tests";
              }}
            >
              Back to Mock Tests
            </button>

            <button
              type="button"
              className="result-secondary"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mock-attempt-page">
        <div className="mock-attempt-error">
          <div>!</div>
          <h2>
            Unable to open this test
          </h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/mock-tests";
            }}
          >
            Back to Mock Tests
          </button>
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="mock-attempt-page">
        <div className="mock-attempt-error">
          <div>!</div>
          <h2>No questions available</h2>
          <p>
            This mock test does not currently
            have any active questions.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/mock-tests";
            }}
          >
            Back to Mock Tests
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mock-attempt-page">
      <header className="attempt-header">
        <button
          type="button"
          className="attempt-brand"
          onClick={() => {
            window.location.href =
              "/dashboard";
          }}
        >
          <span>O</span>
          <strong>OJDV</strong>
        </button>

        <div className="attempt-title">
          <span>MOCK TEST</span>
          <strong>
            {mockTest?.title}
          </strong>
        </div>

        <div className="attempt-header-right">
          <span
            className={`save-indicator ${
              saving ? "is-saving" : ""
            }`}
          >
            {saving
              ? "Saving..."
              : "Progress saved"}
          </span>

          <div
            className={`attempt-timer ${
              remainingSeconds <= 60
                ? "timer-warning"
                : ""
            }`}
          >
            <span>TIME LEFT</span>
            <strong>
              {formatTime(
                remainingSeconds
              )}
            </strong>
          </div>
        </div>
      </header>

      <div className="attempt-layout">
        <section className="attempt-main">
          <div className="attempt-meta">
            <div>
              <span>
                QUESTION
              </span>

              <strong>
                {currentIndex + 1}
                {" "}
                / {questions.length}
              </strong>
            </div>

            <div>
              <span>
                MARKS
              </span>

              <strong>
                {currentQuestion?.marks ||
                  0}
              </strong>
            </div>

            {currentQuestion?.negativeMarks >
              0 && (
              <div>
                <span>
                  NEGATIVE
                </span>

                <strong>
                  -
                  {
                    currentQuestion.negativeMarks
                  }
                </strong>
              </div>
            )}
          </div>

          <article className="question-card">
            <div className="question-tags">
              {currentQuestion?.subject && (
                <span>
                  {currentQuestion.subject}
                </span>
              )}

              {currentQuestion?.topic && (
                <span>
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            <h1>
              {currentQuestion?.questionText}
            </h1>

            <div className="options-list">
              {(
                currentQuestion?.options ||
                []
              ).map(
                (option, optionIndex) => {
                  const selected =
                    Number(
                      currentAnswer.selectedOption
                    ) ===
                    optionIndex;

                  return (
                    <button
                      type="button"
                      key={`${currentQuestionId}-${optionIndex}`}
                      className={`option-button ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateAnswer(
                          optionIndex
                        )
                      }
                    >
                      <span className="option-letter">
                        {String.fromCharCode(
                          65 +
                            optionIndex
                        )}
                      </span>

                      <span className="option-text">
                        {option}
                      </span>

                      <span className="option-check">
                        {selected
                          ? "✓"
                          : ""}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="question-controls">
              <button
                type="button"
                className={`review-button ${
                  currentAnswer.markedForReview
                    ? "active"
                    : ""
                }`}
                onClick={toggleReview}
              >
                {currentAnswer.markedForReview
                  ? "★ Marked for review"
                  : "☆ Mark for review"}
              </button>

              <button
                type="button"
                className="clear-button"
                onClick={() => {
                  const nextAnswers = {
                    ...answers,
                    [currentQuestionId]: {
                      ...currentAnswer,
                      selectedOption:
                        null,
                      answeredAt:
                        null,
                    },
                  };

                  setAnswers(
                    nextAnswers
                  );
                }}
              >
                Clear answer
              </button>
            </div>
          </article>

          <div className="question-navigation">
            <button
              type="button"
              className="nav-secondary"
              disabled={
                currentIndex === 0
              }
              onClick={() =>
                goToQuestion(
                  currentIndex - 1
                )
              }
            >
              ← Previous
            </button>

            <button
              type="button"
              className="nav-primary"
              disabled={
                currentIndex ===
                questions.length - 1
              }
              onClick={() =>
                goToQuestion(
                  currentIndex + 1
                )
              }
            >
              Next →
            </button>
          </div>
        </section>

        <aside className="attempt-sidebar">
          <div className="sidebar-test-info">
            <span>YOUR PROGRESS</span>

            <strong>
              {answeredCount} /{" "}
              {questions.length}
            </strong>

            <div className="progress-track">
              <span
                style={{
                  width: `${
                    questions.length
                      ? (answeredCount /
                          questions.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="question-stats">
            <div>
              <span className="legend-dot answered" />
              Answered
              <strong>
                {answeredCount}
              </strong>
            </div>

            <div>
              <span className="legend-dot unanswered" />
              Unanswered
              <strong>
                {unansweredCount}
              </strong>
            </div>

            <div>
              <span className="legend-dot review" />
              Review
              <strong>
                {reviewCount}
              </strong>
            </div>
          </div>

          <div className="question-palette">
            <div className="palette-title">
              <strong>
                Questions
              </strong>

              <span>
                {questions.length}
              </span>
            </div>

            <div className="palette-grid">
              {questions.map(
                (question, index) => {
                  const questionId =
                    getQuestionId(
                      question
                    );

                  const answer =
                    answers[
                      questionId
                    ];

                  const isAnswered =
                    answer &&
                    Number.isInteger(
                      Number(
                        answer.selectedOption
                      )
                    );

                  const isReview =
                    answer?.markedForReview;

                  return (
                    <button
                      type="button"
                      key={questionId}
                      className={[
                        index ===
                        currentIndex
                          ? "current"
                          : "",
                        isAnswered
                          ? "answered"
                          : "",
                        isReview
                          ? "review"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        goToQuestion(
                          index
                        )
                      }
                    >
                      {index + 1}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="sidebar-submit">
            <p>
              You have answered{" "}
              <strong>
                {answeredCount}
              </strong>{" "}
              of{" "}
              <strong>
                {questions.length}
              </strong>{" "}
              questions.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowSubmitConfirm(
                  true
                )
              }
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Test"}
            </button>
          </div>
        </aside>
      </div>

      {showSubmitConfirm && (
        <div className="submit-modal-backdrop">
          <div className="submit-modal">
            <span className="modal-icon">
              ?
            </span>

            <h2>
              Submit your test?
            </h2>

            <p>
              You have{" "}
              <strong>
                {unansweredCount}
              </strong>{" "}
              unanswered question
              {unansweredCount === 1
                ? ""
                : "s"}
              .
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() =>
                  setShowSubmitConfirm(
                    false
                  )
                }
              >
                Continue Test
              </button>

              <button
                type="button"
                className="modal-submit"
                onClick={() =>
                  submitTest(false)
                }
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MockTestAttempt;
