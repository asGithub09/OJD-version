const express = require("express");

const {
  createCourse,
  getPublishedCourses,
  getFeaturedCourses,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../services/courseService");

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
 * ============================================================
 * PUBLIC
 * GET /api/courses
 *
 * Returns published courses for the landing page.
 * ============================================================
 */

router.get(
  "/",
  async (req, res, next) => {
    try {
      const courses =
        await getPublishedCourses();

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ============================================================
 * PUBLIC
 * GET /api/courses/featured
 *
 * Returns published + featured courses.
 * ============================================================
 */

router.get(
  "/featured",
  async (req, res, next) => {
    try {
      const courses =
        await getFeaturedCourses();

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ============================================================
 * PUBLIC
 * GET /api/courses/public/:id
 *
 * Returns a single published course.
 *
 * This endpoint is used by the student-facing
 * CourseDetails page.
 *
 * IMPORTANT:
 * - No authentication required.
 * - Only published courses are returned.
 * - Unpublished/admin-only course data is not exposed.
 * ============================================================
 */

router.get(
  "/public/:id",
  async (req, res, next) => {
    try {
      const course =
        await getCourseById(
          req.params.id
        );

      if (!course) {
        return res.status(404).json({
          success: false,
          message:
            "Course not found.",
        });
      }

      /*
       * Never expose unpublished courses
       * through the public endpoint.
       */

      if (!course.published) {
        return res.status(404).json({
          success: false,
          message:
            "Course not found.",
        });
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ============================================================
 * ADMIN
 * GET /api/courses/admin
 *
 * Returns all courses including unpublished courses.
 * ============================================================
 */

router.get(
  "/admin",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const courses =
        await getAllCourses();

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ============================================================
 * ADMIN
 * GET /api/courses/:id
 *
 * Returns a course for authenticated administrators.
 *
 * This remains protected.
 * ============================================================
 */

router.get(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const course =
        await getCourseById(
          req.params.id
        );

      if (!course) {
        return res.status(404).json({
          success: false,
          message:
            "Course not found.",
        });
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ============================================================
 * ADMIN
 * POST /api/courses
 *
 * Creates a new course.
 * ============================================================
 */

router.post(
  "/",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const course =
        await createCourse(
          req.body
        );

      res.status(201).json({
        success: true,
        message:
          "Course created successfully.",
        course,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ============================================================
 * ADMIN
 * PUT /api/courses/:id
 *
 * Updates an existing course.
 * ============================================================
 */

router.put(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const course =
        await updateCourse(
          req.params.id,
          req.body
        );

      if (!course) {
        return res.status(404).json({
          success: false,
          message:
            "Course not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Course updated successfully.",
        course,
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
 * ============================================================
 * ADMIN
 * DELETE /api/courses/:id
 *
 * Deletes an existing course.
 * ============================================================
 */

router.delete(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const course =
        await deleteCourse(
          req.params.id
        );

      if (!course) {
        return res.status(404).json({
          success: false,
          message:
            "Course not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Course deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router;

