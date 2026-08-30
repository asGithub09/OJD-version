const express = require("express");

const {
  createCourseModule,
  getPublishedCourseModules,
  getAllCourseModules,
  getCourseModuleById,
  updateCourseModule,
  deleteCourseModule,
} = require("../services/courseModuleService");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

const adminOnly = [
  authenticate,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
];

/*
 * PUBLIC
 * GET /api/course-modules/course/:courseId
 *
 * Returns published modules for a course.
 */
router.get(
  "/course/:courseId",
  async (req, res, next) => {
    try {
      const modules =
        await getPublishedCourseModules(
          req.params.courseId
        );

      res.status(200).json({
        success: true,
        modules,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * GET /api/course-modules/admin/course/:courseId
 *
 * Returns all modules for a course,
 * including unpublished modules.
 */
router.get(
  "/admin/course/:courseId",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const modules =
        await getAllCourseModules(
          req.params.courseId
        );

      res.status(200).json({
        success: true,
        modules,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * GET /api/course-modules/:id
 */
router.get(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const module =
        await getCourseModuleById(
          req.params.id
        );

      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Course module not found.",
        });
      }

      res.status(200).json({
        success: true,
        module,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * POST /api/course-modules
 */
router.post(
  "/",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const module =
        await createCourseModule(
          req.body
        );

      res.status(201).json({
        success: true,
        message:
          "Course module created successfully.",
        module,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * PUT /api/course-modules/:id
 */
router.put(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const module =
        await updateCourseModule(
          req.params.id,
          req.body
        );

      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Course module not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Course module updated successfully.",
        module,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * DELETE /api/course-modules/:id
 */
router.delete(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const module =
        await deleteCourseModule(
          req.params.id
        );

      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Course module not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Course module deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;