const express = require("express");

const {
  createCourseLesson,
  getPublishedCourseLessons,
  getAllCourseLessons,
  getCourseLessonById,
  updateCourseLesson,
  deleteCourseLesson,
} = require("../services/courseLessonService");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


const adminOnly = [
  authenticate,
  authorizeRoles(
    "ADMIN",
    "SUPER_ADMIN"
  ),
];


/*
 * PUBLIC
 *
 * GET
 * /api/course-lessons/module/:moduleId
 *
 * Returns published lessons.
 */
router.get(
  "/module/:moduleId",
  async (req, res, next) => {
    try {
      const lessons =
        await getPublishedCourseLessons(
          req.params.moduleId
        );

      res.status(200).json({
        success: true,
        lessons,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ADMIN
 *
 * GET
 * /api/course-lessons/admin/module/:moduleId
 *
 * Returns all lessons including drafts.
 */
router.get(
  "/admin/module/:moduleId",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const lessons =
        await getAllCourseLessons(
          req.params.moduleId
        );

      res.status(200).json({
        success: true,
        lessons,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ADMIN
 *
 * GET
 * /api/course-lessons/:id
 */
router.get(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const lesson =
        await getCourseLessonById(
          req.params.id
        );

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found.",
        });
      }

      res.status(200).json({
        success: true,
        lesson,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ADMIN
 *
 * POST
 * /api/course-lessons
 */
router.post(
  "/",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const lesson =
        await createCourseLesson(
          req.body
        );

      res.status(201).json({
        success: true,
        message:
          "Course lesson created successfully.",
        lesson,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ADMIN
 *
 * PUT
 * /api/course-lessons/:id
 */
router.put(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const lesson =
        await updateCourseLesson(
          req.params.id,
          req.body
        );

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Course lesson updated successfully.",
        lesson,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ADMIN
 *
 * DELETE
 * /api/course-lessons/:id
 */
router.delete(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const lesson =
        await deleteCourseLesson(
          req.params.id
        );

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Course lesson deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router;