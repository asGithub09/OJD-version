const express = require("express");

const {
  createFaculty,
  getPublishedFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} = require("../services/facultyService");

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
 * GET /api/faculty
 *
 * Returns only published faculty.
 */
router.get("/", async (req, res, next) => {
  try {
    const faculty = await getPublishedFaculty();

    res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    next(error);
  }
});

/*
 * ADMIN
 * GET /api/faculty/admin
 *
 * Returns all faculty including unpublished records.
 */
router.get(
  "/admin",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const faculty = await getAllFaculty();

      res.status(200).json({
        success: true,
        faculty,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * GET /api/faculty/:id
 */
router.get(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const faculty = await getFacultyById(req.params.id);

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty member not found.",
        });
      }

      res.status(200).json({
        success: true,
        faculty,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * POST /api/faculty
 */
router.post(
  "/",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const faculty = await createFaculty(req.body);

      res.status(201).json({
        success: true,
        message: "Faculty member created successfully.",
        faculty,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * PUT /api/faculty/:id
 */
router.put(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const faculty = await updateFaculty(
        req.params.id,
        req.body
      );

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty member not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Faculty member updated successfully.",
        faculty,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * DELETE /api/faculty/:id
 */
router.delete(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const faculty = await deleteFaculty(req.params.id);

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty member not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Faculty member deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;