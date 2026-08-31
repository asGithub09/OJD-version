import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import "./MockTests.css";

const API_BASE_URL =
  import.meta.env.PROD
    ? "https://ojd-version.onrender.com/api"
    : "http://127.0.0.1:5000/api";

const formatDuration = (minutes) => {
  const value = Number(minutes) || 0;

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  return remaining
    ? `${hours}h ${remaining}m`
    : `${hours}h`;
};

function MockTests() {
  const { user, token } = useAuth();

  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const isLoggedIn = Boolean(token && user);

  useEffect(() => {
    let cancelled = false;

    async function loadMockTests() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/mock-tests`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load mock tests."
          );
        }

        if (!cancelled) {
          setMockTests(
            Array.isArray(data.mockTests)
              ? data.mockTests
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Mock tests loading error:",
            err
          );

          setError(
            err.message ||
              "Unable to load mock tests."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMockTests();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const values = mockTests
      .map((test) => test.category)
      .filter(Boolean);

    return [
      "ALL",
      ...Array.from(new Set(values)),
    ];
  }, [mockTests]);

  const filteredTests = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return mockTests.filter((test) => {
      const matchesCategory =
        category === "ALL" ||
        test.category === category;

      const searchableText = [
        test.title,
        test.description,
        test.category,
        test.examType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        );

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    mockTests,
    category,
    search,
  ]);

  const openAuth = (mode = "login") => {
    window.dispatchEvent(
      new CustomEvent("ojdv:open-auth", {
        detail: { mode },
      })
    );
  };

  const startTest = async (test) => {
    if (!isLoggedIn) {
      openAuth("login");
      return;
    }

    if (!test?._id) {
      setError("Unable to start this mock test.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/mock-test-attempts/start/${test._id}`,
        {
          method: "POST",
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
            "Unable to start the mock test."
        );
      }

      const attemptId =
        data.attempt?._id ||
        data.attempt?.id;

      if (!attemptId) {
        throw new Error(
          "Mock test started, but no attempt ID was returned."
        );
      }

      window.location.href =
        `/mock-tests/${attemptId}`;
    } catch (err) {
      console.error(
        "Mock test start error:",
        err
      );

      setError(
        err.message ||
          "Unable to start the mock test."
      );
    }
  };

  return (
    <main className="mock-tests-page">

      <section className="mock-tests-hero">

        <div className="mock-tests-hero-copy">

          <span className="mock-tests-eyebrow">
            OJDV MOCK ARENA
          </span>

          <h1>
            Practice.
            <span> Compete.</span>
            <br />
            Improve.
          </h1>

          <p>
            Challenge yourself with realistic
            mock tests, build your accuracy,
            earn XP and climb the rankings.
          </p>

        </div>

        <div className="mock-gamification-card">

          <div className="mock-gamification-top">

            <div>
              <span className="mock-mini-label">
                YOUR PROGRESS
              </span>

              <strong>
                {isLoggedIn
                  ? "Level 1 Learner"
                  : "Start your journey"}
              </strong>
            </div>

            <div className="mock-xp-badge">
              <span>XP</span>
              <strong>
                {isLoggedIn ? "0" : "—"}
              </strong>
            </div>

          </div>

          <div className="mock-xp-meta">
            <span>
              {isLoggedIn
                ? "0 / 500 XP to Level 2"
                : "Login to start earning XP"}
            </span>

            <strong>
              {isLoggedIn ? "0%" : "—"}
            </strong>
          </div>

          <div className="mock-xp-track">
            <span
              style={{
                width: isLoggedIn
                  ? "0%"
                  : "12%",
              }}
            />
          </div>

          <div className="mock-stats-row">

            <div>
              <span className="mock-stat-icon">
                🔥
              </span>

              <div>
                <strong>
                  {isLoggedIn ? "0" : "—"}
                </strong>

                <span>
                  Day streak
                </span>
              </div>
            </div>

            <div>
              <span className="mock-stat-icon">
                🏆
              </span>

              <div>
                <strong>
                  {isLoggedIn ? "—" : "—"}
                </strong>

                <span>
                  National rank
                </span>
              </div>
            </div>

            <div>
              <span className="mock-stat-icon">
                🎯
              </span>

              <div>
                <strong>
                  {isLoggedIn ? "0%" : "—"}
                </strong>

                <span>
                  Accuracy
                </span>
              </div>
            </div>

          </div>

          {!isLoggedIn && (
            <button
              type="button"
              className="mock-save-progress"
              onClick={() =>
                openAuth("login")
              }
            >
              Login to save your XP & streak
              <span>→</span>
            </button>
          )}

        </div>

      </section>

      <section className="mock-tests-content">

        <div className="mock-tests-heading">

          <div>
            <span className="mock-section-kicker">
              TEST LIBRARY
            </span>

            <h2>
              Choose your challenge
            </h2>

            <p>
              Attempt published tests and
              discover where you stand.
            </p>
          </div>

          <div className="mock-test-count">
            <strong>
              {mockTests.length}
            </strong>

            <span>
              Tests available
            </span>
          </div>

        </div>

        <div className="mock-toolbar">

          <div className="mock-search">

            <span>⌕</span>

            <input
              type="search"
              placeholder="Search tests, exams or subjects..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="mock-filters">

            {categories.map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    category === item
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >
                  {item === "ALL"
                    ? "All tests"
                    : item}
                </button>
              )
            )}

          </div>

        </div>

        {loading && (
          <div className="mock-tests-state">
            <div className="mock-loader" />
            <strong>
              Loading mock tests...
            </strong>
            <span>
              Preparing your practice arena.
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="mock-tests-state mock-tests-error">
            <strong>
              We couldn't load the tests.
            </strong>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredTests.length === 0 && (
            <div className="mock-tests-state">
              <div className="mock-empty-icon">
                ?
              </div>

              <strong>
                No matching mock tests
              </strong>

              <span>
                Try another search or category.
              </span>
            </div>
          )}

        {!loading &&
          !error &&
          filteredTests.length > 0 && (
            <div className="mock-test-grid">

              {filteredTests.map(
                (test, index) => (
                  <article
                    key={test._id}
                    className="mock-test-card"
                  >

                    <div className="mock-test-card-top">

                      <span className="mock-test-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <span className="mock-test-category">
                        {test.category ||
                          "General"}
                      </span>

                    </div>

                    <div className="mock-test-card-body">

                      <h3>
                        {test.title}
                      </h3>

                      <p>
                        {test.description ||
                          "Test your preparation with this OJDV mock examination."}
                      </p>

                    </div>

                    <div className="mock-test-meta">

                      <span>
                        <strong>
                          {test.questionCount ||
                            0}
                        </strong>
                        Questions
                      </span>

                      <span>
                        <strong>
                          {formatDuration(
                            test.durationMinutes
                          )}
                        </strong>
                        Duration
                      </span>

                      <span>
                        <strong>
                          {test.totalMarks ||
                            0}
                        </strong>
                        Marks
                      </span>

                    </div>

                    <div className="mock-test-card-footer">

                      <span className="mock-test-exam">
                        {test.examType ||
                          "Mock Test"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          startTest(test)
                        }
                      >
                        {isLoggedIn
                          ? "Start test"
                          : "Try test"}
                        <span>→</span>
                      </button>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

      </section>

    </main>
  );
}

export default MockTests;




