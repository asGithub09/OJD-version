const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const courseModuleRoutes = require("./routes/courseModuleRoutes");
const courseLessonRoutes = require("./routes/courseLessonRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const mockTestRoutes = require("./routes/mockTestRoutes");
const mockTestAttemptRoutes = require("./routes/mockTestAttemptRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const mockQuestionRoutes = require("./routes/mockQuestionRoutes");
const studentCourseProgressRoutes = require(
  "./routes/studentCourseProgressRoutes"
);

const app = express();

const PORT = process.env.PORT || 5000;


/*
 * ============================================================
 * CORS
 * ============================================================
 */

const configuredFrontendOrigins = (
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_URLS ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  // OJDV / Vite development
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  // JobWay / Next.js development
  "http://localhost:3000",
  "http://127.0.0.1:3000",

  // Existing production frontend
  "https://ojd-version.vercel.app",

  // Deployment-configured frontend origins
  ...configuredFrontendOrigins,
];

console.log(
  "Allowed CORS origins:",
  allowedOrigins
);


/*
 * ============================================================
 * SECURITY
 * ============================================================
 */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          "CORS policy does not allow this origin."
        )
      );
    },

    credentials: true,
  })
);


/*
 * ============================================================
 * BODY PARSERS
 * ============================================================
 */

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());


/*
 * ============================================================
 * API RATE LIMITER
 * ============================================================
 */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit:
    process.env.NODE_ENV === "production"
      ? 300
      : 2000,

  standardHeaders: "draft-7",

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);


/*
 * ============================================================
 * API ROUTES
 * ============================================================
 */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/mock-tests",
  mockTestRoutes
);

app.use(
  "/api/mock-tests",
  mockQuestionRoutes
);

app.use(
  "/api/mock-test-attempts",
  mockTestAttemptRoutes
);

app.use(
  "/api/gamification",
  gamificationRoutes
);

app.use(
  "/api/courses",
  courseRoutes
);

app.use(
  "/api/course-progress",
  studentCourseProgressRoutes
);

app.use(
  "/api/course-modules",
  courseModuleRoutes
);

app.use(
  "/api/course-lessons",
  courseLessonRoutes
);

app.use(
  "/api/faculty",
  facultyRoutes
);


/*
 * ============================================================
 * ROOT
 * ============================================================
 */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "OJDV Education API is running.",
    service:
      "OJDV Education Backend",
    version: "1.0.0",
  });
});


/*
 * ============================================================
 * HEALTH CHECK
 * ============================================================
 */

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "OJDV Education API is healthy.",
      timestamp:
        new Date().toISOString(),
    });
  }
);


/*
 * ============================================================
 * 404
 * ============================================================
 */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      "API route not found.",
    path: req.originalUrl,
  });
});


/*
 * ============================================================
 * ERROR HANDLER
 * ============================================================
 */

app.use(
  (err, req, res, next) => {
    console.error(
      "Server error:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,

      message:
        process.env.NODE_ENV ===
        "production"
          ? "Internal server error."
          : err.message ||
            "Internal server error.",
    });
  }
);


/*
 * ============================================================
 * START SERVER
 * ============================================================
 */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      PORT,
      () => {
        console.log("");

        console.log(
          "========================================"
        );

        console.log(
          "       OJDV EDUCATION BACKEND"
        );

        console.log(
          "========================================"
        );

        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          `Local: http://localhost:${PORT}`
        );

        console.log(
          `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          "========================================"
        );

        console.log("");
      }
    );
  } catch (error) {
    console.error("");

    console.error(
      "========================================"
    );

    console.error(
      "       OJDV SERVER STARTUP FAILED"
    );

    console.error(
      "========================================"
    );

    console.error(
      error.message
    );

    console.error(
      "========================================"
    );

    console.error("");

    process.exit(1);
  }
};

startServer();
