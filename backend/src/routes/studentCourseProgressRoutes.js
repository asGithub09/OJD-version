const express = require("express");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getCourseProgress,
  updateLastLesson,
  completeLesson,
  uncompleteLesson,
} = require("../services/studentCourseProgressService");

const router = express.Router();

/*
 * ============================================================
 * ALL PROGRESS ROUTES REQUIRE AUTHENTICATION
 * ============================================================
 */

router.use(authenticate);

/*
 * ============================================================
 * GET COURSE PROGRESS
 * GET /api/course-progress/course/:courseId
 * ============================================================
 */

router.get(
  "/course/:courseId",
  authorizeRoles("STUDENT"),
  async (req, res, next) => {
    try {
      const progress =
        await getCourseProgress(
          req.user._id,
          req.params.courseId
        );

      return res.status(200).json({
        success: true,
        progress,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ============================================================
 * UPDATE LAST OPENED LESSON
 * POST /api/course-progress/course/:courseId/lesson/:lessonId/open
 * ============================================================
 */

router.post(
  "/course/:courseId/lesson/:lessonId/open",
  authorizeRoles("STUDENT"),
  async (req, res, next) => {
    try {
      const progress =
        await updateLastLesson(
          req.user._id,
          req.params.courseId,
          req.params.lessonId
        );

      return res.status(200).json({
        success: true,
        message: "Lesson progress updated.",
        progress,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ============================================================
 * COMPLETE LESSON
 * POST /api/course-progress/course/:courseId/lesson/:lessonId/complete
 * ============================================================
 */

router.post(
  "/course/:courseId/lesson/:lessonId/complete",
  authorizeRoles("STUDENT"),
  async (req, res, next) => {
    try {
      const progress =
        await completeLesson(
          req.user._id,
          req.params.courseId,
          req.params.lessonId
        );

      return res.status(200).json({
        success: true,
        message: "Lesson marked as complete.",
        progress,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ============================================================
 * UNCOMPLETE LESSON
 * POST /api/course-progress/course/:courseId/lesson/:lessonId/uncomplete
 * ============================================================
 */

router.post(
  "/course/:courseId/lesson/:lessonId/uncomplete",
  authorizeRoles("STUDENT"),
  async (req, res, next) => {
    try {
      const progress =
        await uncompleteLesson(
          req.user._id,
          req.params.courseId,
          req.params.lessonId
        );

      return res.status(200).json({
        success: true,
        message: "Lesson marked as incomplete.",
        progress,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;