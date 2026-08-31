import Courses from "./pages/Courses.jsx";
import CourseLessonViewer from "./pages/CourseLessonViewer.jsx";
import AdminCourseLessons from "./pages/Admin/AdminCourseLessons.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminCourses from "./pages/Admin/AdminCourses.jsx";

import AdminCourseModules from "./pages/Admin/AdminCourseModules.jsx";
import { useEffect, useState } from "react";

import { login, register, verifyEmail } from "./services/api";
import { useAuth } from "./auth/AuthContext.jsx";

import AppShell from "./components/AppShell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MockTests from "./pages/MockTests.jsx";
import MockTestAttempt from "./pages/MockTestAttempt.jsx";
import MagicRings from "./components/MagicRings.jsx";
import GlowCursor from "./components/GlowCursor.jsx";

import "./App.css";

/* ============================================================
   OJDV — LANDING PAGE DATA
   ============================================================ */

const courses = [
  {
    title: "UPSC Civil Services",
    description:
      "Structured preparation for India's most competitive civil services examination.",
    category: "CIVIL SERVICES",
    level: "Foundation → Advanced",
    lessons: "250+ Lessons",
    tests: "80+ Tests",
    accent: "orange",
    letter: "U",
  },
  {
    title: "SSC Government Exams",
    description:
      "Build speed, accuracy and confidence for SSC examinations with focused practice.",
    category: "GOVERNMENT EXAMS",
    level: "Beginner → Advanced",
    lessons: "180+ Lessons",
    tests: "60+ Tests",
    accent: "green",
    letter: "S",
  },
  {
    title: "JEE & Engineering",
    description:
      "Concept-first learning and examination practice for engineering aspirants.",
    category: "ENGINEERING",
    level: "Class 11 → 12",
    lessons: "220+ Lessons",
    tests: "90+ Tests",
    accent: "violet",
    letter: "E",
  },
  {
    title: "NEET & Medical",
    description:
      "Focused preparation for medical entrance examinations with systematic practice.",
    category: "MEDICAL",
    level: "Class 11 → 12",
    lessons: "240+ Lessons",
    tests: "100+ Tests",
    accent: "rose",
    letter: "M",
  },
  {
    title: "School Foundation",
    description:
      "Strong academic foundations designed to help students learn with confidence.",
    category: "SCHOOL",
    level: "Class 6 → 10",
    lessons: "160+ Lessons",
    tests: "50+ Tests",
    accent: "gold",
    letter: "A",
  },
];

const goals = [
  {
    title: "UPSC",
    subtitle: "Civil Services",
    icon: "U",
  },
  {
    title: "SSC",
    subtitle: "Government Exams",
    icon: "S",
  },
  {
    title: "JEE",
    subtitle: "Engineering",
    icon: "E",
  },
  {
    title: "NEET",
    subtitle: "Medical",
    icon: "M",
  },
  {
    title: "School",
    subtitle: "Boards & Foundation",
    icon: "A",
  },
  {
    title: "More",
    subtitle: "Explore all exams",
    icon: "+",
  },
];

/* ============================================================
   ROLE LABELS
   ============================================================ */

const roleLabels = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};

/* ============================================================
   APP
   ============================================================ */

function App() {
  const {
    isAuthenticated,
    user,
    signIn,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [courseIndex, setCourseIndex] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(0);

  const [landingCourses, setLandingCourses] = useState(courses);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);

  /* ==========================================================
     CLIENT-SIDE NAVIGATION
     Keep route changes reactive without introducing a router.
     ========================================================== */

  const [currentPath, setCurrentPath] = useState(
    window.location.pathname
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateTo = (path, replace = false) => {
    if (!path) {
      return;
    }

    if (window.location.pathname === path) {
      setCurrentPath(path);
      return;
    }

    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }

    setCurrentPath(path);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ==========================================================
     PUBLIC COURSE DATA
     ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);

        const response = await fetch("/api/courses");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load courses."
          );
        }

        const apiCourses = Array.isArray(data.courses)
          ? data.courses
          : Array.isArray(data)
            ? data
            : [];

        if (cancelled) {
          return;
        }

        const accentOptions = ["orange", "green", "gold"];

        const formattedCourses = apiCourses.map(
          (course, index) => ({
            id: course._id || course.id,

            title:
              course.title ||
              "OJDV Course",

            description:
              course.shortDescription ||
              course.description ||
              "Structured learning for serious preparation.",

            category:
              course.category ||
              "OJDV EDUCATION",

            level:
              course.level === "BEGINNER"
                ? "Beginner"
                : course.level === "INTERMEDIATE"
                  ? "Intermediate"
                  : course.level === "ADVANCED"
                    ? "Advanced"
                    : "All Levels",

            lessons:
              course.lessonCount != null
                ? `${course.lessonCount} Lessons`
                : course.duration ||
                  "Structured Learning",

            tests:
              course.testCount != null
                ? `${course.testCount} Tests`
                : course.published
                  ? "Available Practice"
                  : "Coming Soon",

            accent:
              accentOptions[index % accentOptions.length],

            letter:
              course.title?.charAt(0)?.toUpperCase() || "O",

            thumbnailUrl:
              course.thumbnailUrl || "",
          })
        );

        if (formattedCourses.length > 0) {
          setLandingCourses(formattedCourses);
          setCourseIndex(0);
        }
      } catch (error) {
        console.error(
          "Landing courses load error:",
          error
        );

        // Keep the existing landing-page courses as
        // a safe fallback if the API is unavailable.
      } finally {
        if (!cancelled) {
          setCoursesLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     AUTH HELPERS
     ========================================================== */

  const updateField = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  const openAuth = (nextMode = "login") => {
    setMode(nextMode);
    setStep("form");
    setOtp("");
    setUserId("");
    resetMessages();
    setAuthOpen(true);
  };

  const closeAuth = () => {
    if (loading) {
      return;
    }

    setAuthOpen(false);
    resetMessages();
    setStep("form");
    setOtp("");
    setUserId("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep("form");
    setOtp("");
    setUserId("");
    resetMessages();
  };

  /* ==========================================================
     REGISTER
     ========================================================== */

  const handleRegister = async (event) => {
    event.preventDefault();

    resetMessages();
    setLoading(true);

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      setUserId(result.user.id);
      setStep("otp");

      setMessage(
        result.message ||
          "Registration successful. Check your email for the verification code."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     VERIFY EMAIL
     ========================================================== */

  const handleVerifyEmail = async (event) => {
    event.preventDefault();

    resetMessages();
    setLoading(true);

    try {
      const result = await verifyEmail({
        userId,
        otp,
      });

      if (result.token) {
        signIn({
          token: result.token,
          user: result.user,
        });
      }

      setMessage(
        result.message ||
          "Email verified successfully. Your account is now active."
      );

      if (result.token) {
        setAuthOpen(false);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to verify your email."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     LOGIN
     ========================================================== */

  const handleLogin = async (event) => {
    event.preventDefault();

    resetMessages();
    setLoading(true);

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      signIn({
        token: result.token,
        user: result.user,
      });

      setMessage(
        result.message ||
          "Login successful."
      );

      setAuthOpen(false);

      /*
       * ADMIN LOGIN
       * Send administrators directly to the admin dashboard.
       */
      if (
        result.user?.role === "ADMIN" ||
        result.user?.role === "SUPER_ADMIN"
      ) {
        navigateTo("/admin");
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * STUDENT COURSE DETAILS
   * /course/:courseId
   * ==========================================================
   */
  /*
 * ==========================================================
 * STUDENT COURSE LESSON
 * /course/:courseId/lesson/:moduleId/:lessonId
 * ==========================================================
 */

const courseLessonMatch =
  currentPath.match(
    /^\/course\/([^/]+)\/lesson\/([^/]+)\/([^/]+)$/
  );

if (courseLessonMatch) {
  const courseId = courseLessonMatch[1];
  const moduleId = courseLessonMatch[2];
  const lessonId = courseLessonMatch[3];

  return (
    <CourseLessonViewer
      courseId={courseId}
      moduleId={moduleId}
      lessonId={lessonId}
    />
  );
}

  const courseDetailsMatch =
    currentPath.match(
      /^\/course\/([^/]+)$/
    );

  if (courseDetailsMatch) {
    const courseId =
      courseDetailsMatch[1];

    return (
      <CourseDetails
        courseId={courseId}
      />
    );
  }
  /* ==========================================================
     STUDENT COURSES
     /courses
     ========================================================== */

  if (
    isAuthenticated &&
    currentPath === "/courses"
  ) {
    return (
      <AppShell>
        <Courses />
      </AppShell>
    );
  }

  /* ==========================================================
     DASHBOARD
     ========================================================== */

  if (isAuthenticated) {
    const isAdmin =
      user?.role === "ADMIN" ||
      user?.role === "SUPER_ADMIN";

    if (isAdmin) {
      /*
       * ADMIN DASHBOARD
       * /admin
       */
      if (currentPath === "/admin") {
        return <AdminDashboard />;
      }

      /*
       * ADMIN COURSES
       * /admin/courses
       */
      if (currentPath === "/admin/courses") {
        return <AdminCourses />;
      }

      /*
       * COURSE CONTENT
       * /admin/courses/:courseId/modules
       */
      const courseModulesMatch =
        currentPath.match(
          /^\/admin\/courses\/([^/]+)\/modules$/
        );

      if (courseModulesMatch) {
        const courseId =
          courseModulesMatch[1];

        return (
          <AdminCourseModules
            courseId={courseId}
          />
        );
      }

      /*
       * COURSE LESSONS
       * /admin/courses/:courseId/modules/:moduleId/lessons
       */
      const courseLessonsMatch =
        currentPath.match(
          /^\/admin\/courses\/([^/]+)\/modules\/([^/]+)\/lessons$/
        );

      if (courseLessonsMatch) {
        const courseId =
          courseLessonsMatch[1];

        const moduleId =
          courseLessonsMatch[2];

        return (
          <AdminCourseLessons
            courseId={courseId}
            moduleId={moduleId}
          />
        );
      }

      /*
       * Unknown admin route
       */
      if (currentPath.startsWith("/admin")) {
        return <AdminDashboard />;
      }
    }

    /*
     * Normal authenticated user dashboard
     */
    const mockTestAttemptMatch =
      currentPath.match(
        /^\/mock-tests\/([^/]+)$/
      );

    if (mockTestAttemptMatch) {
      const attemptId =
        mockTestAttemptMatch[1];

      return (
        <AppShell>
          <MockTestAttempt
            attemptId={attemptId}
          />
        </AppShell>
      );
    }

    if (currentPath === "/mock-tests") {
      return (
        <AppShell>
          <MockTests />
        </AppShell>
      );
    }

    return (
      <AppShell>
        <Dashboard />
      </AppShell>
    );
  }

  /* ==========================================================
     COURSE SLIDER
     ========================================================== */

  const visibleCourses =
    landingCourses.length > 0
      ? [
          landingCourses[
            courseIndex %
              landingCourses.length
          ],
          landingCourses[
            (courseIndex + 1) %
              landingCourses.length
          ],
          landingCourses[
            (courseIndex + 2) %
              landingCourses.length
          ],
        ]
      : [];

  const moveCourses = (direction) => {
    if (landingCourses.length <= 1) {
      return;
    }

    setCourseIndex((current) => {
      if (direction === "next") {
        return (
          (current + 1) %
          landingCourses.length
        );
      }

      return (
        (current - 1 +
          landingCourses.length) %
        landingCourses.length
      );
    });
  };

  /* ==========================================================
     LANDING PAGE
     ========================================================== */

  return (
    <div className="site">
      <GlowCursor
        color="#E65B78"
        secondaryColor="#C89A5B"
        trailLength={44}
        trailWidth={8}
        trailTaper={0.82}
        followSpeed={0.18}
        glowIntensity={1.35}
        glowSpread={1.0}
        hotspot={0.7}
        brightness={1.05}
        opacity={0.62}
        pulseSpeed={1}
        noiseStrength={0.02}
        idleFade
        idleTimeout={650}
        fadeDuration={800}
        blendMode="screen"
      />
      {/* ======================================================
          PREMIUM CURSOR
          ====================================================== */}
{/* ======================================================
          HEADER
          ====================================================== */}

      <header className="landing-header">
        <div className="landing-container header-inner">
          <button
            type="button"
            className="logo-button"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            aria-label="OJDV Education home"
          >
            <img
              src="/images/ojd-logo.png"
              alt="OJDV Education"
              className="brand-logo"
            />
          </button>

          <nav
            className="desktop-nav"
            aria-label="Primary navigation"
          >
            <a href="#courses">
              Courses
            </a>

            <a href="#exams">
              Exams
            </a>

            <a href="#why-ojdv">
              Why OJDV
            </a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="login-link"
              onClick={() =>
                openAuth("login")
              }
            >
              Log in
            </button>

            <button
              type="button"
              className="header-cta"
              onClick={() =>
                openAuth("register")
              }
            >
              Join for free
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="hero-section">
                <div className="hero-background">
          <MagicRings
            color="#FF7A18"
            colorMiddle="#FFFFFF"
            colorTwo="#18A558"
            speed={0.42}
            ringCount={6}
            attenuation={10}
            lineThickness={2}
            baseRadius={0.35}
            radiusStep={0.1}
            scaleRate={0.1}
            opacity={0.12}
            blur={0}
            noiseAmount={0.018}
            rotation={0}
            ringGap={1.5}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse
            mouseInfluence={0.08}
            hoverScale={1.04}
            parallax={0.015}
          />
        </div>

        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <div className="hero-pill">
              <span className="pill-dot" />

              India's learning platform
            </div>

            <h1>
              Learn better.
              <br />

              <span>
                Prepare smarter.
              </span>

              <br />

              Achieve more.
            </h1>

            <p className="hero-description">
              Learn from expert educators,
              practice with powerful
              examinations, and build the
              confidence to reach your goals.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-hero-button"
                onClick={() =>
                  openAuth("register")
                }
              >
                Start learning free
                <span>→</span>
              </button>

              <a
                href="#exams"
                className="secondary-hero-button"
              >
                Explore exams
              </a>
            </div>

            <div className="hero-proof">
              <div className="proof-avatars">
                <span>O</span>
                <span>J</span>
                <span>D</span>
                <span>V</span>
              </div>

              <div>
                <strong>
                  Trusted by learners
                </strong>

                <span>
                  Across courses, exams &
                  preparation
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================
              HERO VISUAL
              ================================================== */}

          <div className="hero-visual">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />

            <div className="hero-glass-card main-learning-card">
              <div className="learning-card-top">
                <span className="mini-label">
                  YOUR LEARNING
                </span>

                <span className="live-dot">
                  ● LIVE
                </span>
              </div>

              <div className="learning-title">
                <div className="learning-icon">
                  O
                </div>

                <div>
                  <strong>
                    OJDV Learning Hub
                  </strong>

                  <span>
                    Personalised preparation
                  </span>
                </div>
              </div>

              <div className="progress-area">
                <div className="progress-label">
                  <span>
                    Weekly progress
                  </span>

                  <strong>
                    78%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-value"
                    style={{
                      width: "78%",
                    }}
                  />
                </div>
              </div>

              <div className="learning-stats">
                <div>
                  <strong>
                    24
                  </strong>

                  <span>
                    Lessons
                  </span>
                </div>

                <div>
                  <strong>
                    08
                  </strong>

                  <span>
                    Tests
                  </span>
                </div>

                <div>
                  <strong>
                    92%
                  </strong>

                  <span>
                    Accuracy
                  </span>
                </div>
              </div>
            </div>

            <div className="floating-card floating-course">
              <span className="floating-icon orange">
                ✓
              </span>

              <div>
                <strong>
                  Mock Test
                </strong>

                <span>
                  Ready to attempt
                </span>
              </div>
            </div>

            <div className="floating-card floating-score">
              <span className="floating-icon green">
                ↗
              </span>

              <div>
                <strong>
                  +18.4%
                </strong>

                <span>
                  Performance
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          GOALS
          ====================================================== */}

      <section
        id="exams"
        className="goals-section"
      >
        <div className="landing-container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                FIND YOUR PATH
              </span>

              <h2>
                Select your goal / exam
              </h2>

              <p>
                Choose a learning path designed
                around your ambition.
              </p>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={() =>
                openAuth("register")
              }
            >
              View all
              <span>→</span>
            </button>
          </div>

          <div className="goal-grid">
            {goals.map(
              (goal, index) => (
                <button
                  type="button"
                  key={goal.title}
                  className={`goal-card ${
                    selectedGoal === index
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedGoal(index)
                  }
                >
                  <span className="goal-icon">
                    {goal.icon}
                  </span>

                  <span className="goal-content">
                    <strong>
                      {goal.title}
                    </strong>

                    <span>
                      {goal.subtitle}
                    </span>
                  </span>

                  <span className="goal-arrow">
                    ↗
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          COURSES
          ====================================================== */}

      <section
        id="courses"
        className="courses-section"
      >
        <div className="landing-container">
          <div className="section-heading courses-heading">
            <div>
              <span className="section-kicker">
                LEARN WITH OJDV
              </span>

              <h2>
                Explore popular courses
              </h2>

              <p>
                Learn from structured,
                goal-oriented courses built
                for serious preparation.
              </p>
            </div>

            <div className="slider-controls">
              <button
                type="button"
                aria-label="Previous courses"
                onClick={() =>
                  moveCourses("previous")
                }
              >
                ←
              </button>

              <button
                type="button"
                aria-label="Next courses"
                onClick={() =>
                  moveCourses("next")
                }
              >
                →
              </button>
            </div>
          </div>

          <div className="course-slider">
            {coursesLoading && visibleCourses.length === 0 ? (
              <div className="course-loading">
                Loading courses...
              </div>
            ) : (
              visibleCourses.map(
                (course, index) => (
                <article
                  key={`${course.title}-${index}`}
                  className={`course-card course-${course.accent}`}
                  onClick={() =>
                    openAuth("register")
                  }
                >
                  <div className="course-illustration">
                    <span className="course-orb orb-a" />
                    <span className="course-orb orb-b" />

                    <span className="course-letter">
                      {course.letter}
                    </span>
                  </div>

                  <div className="course-card-content">
                    <span className="course-category">
                      {course.category}
                    </span>

                    <h3>
                      {course.title}
                    </h3>

                    <p>
                      {course.description}
                    </p>

                    <div className="course-meta">
                      <span>
                        {course.level}
                      </span>

                      <span>
                        {course.lessons}
                      </span>

                      <span>
                        {course.tests}
                      </span>
                    </div>

                    <div className="course-footer">
                      <span className="course-link">
                        Explore →
                      </span>
                    </div>
                  </div>
                </article>
              )
              )
            )}
          </div>

          <div className="slider-dots">
            {landingCourses.map(
              (course, index) => (
                <button
                  type="button"
                  key={course.title}
                  className={
                    index === courseIndex
                      ? "active"
                      : ""
                  }
                  aria-label={`Show course ${
                    index + 1
                  }`}
                  onClick={() =>
                    setCourseIndex(index)
                  }
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          WHY OJDV
          ====================================================== */}

      <section
        id="why-ojdv"
        className="why-section"
      >
        <div className="landing-container why-grid">
          <div className="why-copy">
            <span className="section-kicker">
              WHY OJDV
            </span>

            <h2>
              Everything you need to
              <span>
                prepare with confidence.
              </span>
            </h2>

            <p>
              OJDV brings learning, practice,
              examinations and performance
              tracking into one focused
              education experience.
            </p>

            <button
              type="button"
              className="primary-hero-button"
              onClick={() =>
                openAuth("register")
              }
            >
              Start your journey
              <span>→</span>
            </button>
          </div>

          <div className="benefits-grid">
            <article className="benefit-card">
              <span className="benefit-number">
                01
              </span>

              <h3>
                Expert Learning
              </h3>

              <p>
                Structured learning experiences
                designed around your examination
                goals.
              </p>
            </article>

            <article className="benefit-card">
              <span className="benefit-number">
                02
              </span>

              <h3>
                Smart Practice
              </h3>

              <p>
                Strengthen concepts through
                targeted questions and realistic
                examinations.
              </p>
            </article>

            <article className="benefit-card">
              <span className="benefit-number">
                03
              </span>

              <h3>
                Performance Insights
              </h3>

              <p>
                Understand your progress,
                accuracy and areas that need
                improvement.
              </p>
            </article>

            <article className="benefit-card">
              <span className="benefit-number">
                04
              </span>

              <h3>
                One Workspace
              </h3>

              <p>
                Keep your courses, examinations
                and academic journey together.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <img
            src="/images/ojd-logo.png"
            alt="OJDV Education"
            className="footer-logo"
          />

          <span>
            India's learning platform for
            ambitious students.
          </span>

          <span>
            © {new Date().getFullYear()} OJDV
            Education
          </span>
        </div>
      </footer>

      {/* ======================================================
          AUTH MODAL
          ====================================================== */}

      {authOpen && (
        <div
          className="auth-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAuth();
            }
          }}
        >
          <div
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            <button
              type="button"
              className="auth-close"
              aria-label="Close"
              onClick={closeAuth}
              disabled={loading}
            >
              ×
            </button>

            <div className="auth-modal-brand">
              <img
                src="/images/ojd-logo.png"
                alt="OJDV Education"
              />
            </div>

            {step === "otp" ? (
              <form
                className="auth-form"
                onSubmit={
                  handleVerifyEmail
                }
              >
                <span className="auth-kicker">
                  ACCOUNT SECURITY
                </span>

                <h2 id="auth-title">
                  Verify your email
                </h2>

                <p>
                  Enter the 6-digit verification
                  code sent to{" "}
                  <strong>
                    {form.email}
                  </strong>
                  .
                </p>

                <label htmlFor="otp">
                  Verification code
                </label>

                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          6
                        )
                    )
                  }
                  required
                />

                {message && (
                  <div className="success-message">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-primary-button"
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                >
                  {loading
                    ? "Verifying..."
                    : "Verify Email"}
                </button>

                <button
                  type="button"
                  className="auth-back-button"
                  onClick={() => {
                    setStep("form");
                    resetMessages();
                  }}
                  disabled={loading}
                >
                  Back to account
                </button>
              </form>
            ) : (
              <>
                <div className="auth-modal-heading">
                  <span className="auth-kicker">
                    {mode === "login"
                      ? "WELCOME BACK"
                      : "GET STARTED"}
                  </span>

                  <h2 id="auth-title">
                    {mode === "login"
                      ? "Welcome back"
                      : "Create your account"}
                  </h2>

                  <p>
                    {mode === "login"
                      ? "Sign in to continue to your OJDV Education workspace."
                      : "Create your secure OJDV Education account and start learning."}
                  </p>
                </div>

                <div className="auth-mode-switch">
                  <button
                    type="button"
                    className={
                      mode === "login"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      switchMode(
                        "login"
                      )
                    }
                    disabled={loading}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    className={
                      mode ===
                      "register"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      switchMode(
                        "register"
                      )
                    }
                    disabled={loading}
                  >
                    Create Account
                  </button>
                </div>

                <form
                  className="auth-form"
                  onSubmit={
                    mode === "login"
                      ? handleLogin
                      : handleRegister
                  }
                >
                  {mode ===
                    "register" && (
                    <>
                      <label htmlFor="name">
                        Full name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={
                          form.name
                        }
                        onChange={
                          updateField
                        }
                        autoComplete="name"
                        required
                      />

                      <label htmlFor="phone">
                        Phone number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+919876543210"
                        value={
                          form.phone
                        }
                        onChange={
                          updateField
                        }
                        autoComplete="tel"
                        required
                      />
                    </>
                  )}

                  <label htmlFor="email">
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={
                      form.email
                    }
                    onChange={
                      updateField
                    }
                    autoComplete="email"
                    required
                  />

                  <label htmlFor="password">
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={
                      form.password
                    }
                    onChange={
                      updateField
                    }
                    minLength={8}
                    autoComplete={
                      mode ===
                      "login"
                        ? "current-password"
                        : "new-password"
                    }
                    required
                  />

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="success-message">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="auth-primary-button"
                    disabled={
                      loading
                    }
                  >
                    {loading
                      ? mode ===
                        "login"
                        ? "Signing in..."
                        : "Creating account..."
                      : mode ===
                        "login"
                        ? "Sign In"
                        : "Create Account"}
                  </button>

                  <p className="auth-security-note">
                    Your OJDV account is protected
                    with secure authentication.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;




