const express = require("express");

const {
  createMockTest,
  getPublishedMockTests,
  getFeaturedMockTests,
  getAllMockTests,
  getMockTestById,
  updateMockTest,
  deleteMockTest,
} = require("../services/mockTestService");

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
 * GET /api/mock-tests
 *
 * Returns published mock tests for the public website.
 */
router.get("/", async (req, res, next) => {
  try {
    const mockTests = await getPublishedMockTests();

    res.status(200).json({
      success: true,
      mockTests,
    });
  } catch (error) {
    next(error);
  }
});

/*
 * PUBLIC
 * GET /api/mock-tests/featured
 *
 * Returns published + featured mock tests.
 */
router.get("/featured", async (req, res, next) => {
  try {
    const mockTests = await getFeaturedMockTests();

    res.status(200).json({
      success: true,
      mockTests,
    });
  } catch (error) {
    next(error);
  }
});

/*
 * ADMIN
 * GET /api/mock-tests/admin
 *
 * Returns all mock tests, including unpublished ones.
 */
router.get(
  "/admin",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const mockTests = await getAllMockTests();

      res.status(200).json({
        success: true,
        mockTests,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * GET /api/mock-tests/:id
 */
router.get(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const mockTest = await getMockTestById(
        req.params.id
      );

      if (!mockTest) {
        return res.status(404).json({
          success: false,
          message: "Mock test not found.",
        });
      }

      res.status(200).json({
        success: true,
        mockTest,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * POST /api/mock-tests
 */
router.post(
  "/",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const mockTest = await createMockTest(req.body);

      res.status(201).json({
        success: true,
        message: "Mock test created successfully.",
        mockTest,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * PUT /api/mock-tests/:id
 */
router.put(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const mockTest = await updateMockTest(
        req.params.id,
        req.body
      );

      if (!mockTest) {
        return res.status(404).json({
          success: false,
          message: "Mock test not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Mock test updated successfully.",
        mockTest,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ADMIN
 * DELETE /api/mock-tests/:id
 */
router.delete(
  "/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const mockTest = await deleteMockTest(
        req.params.id
      );

      if (!mockTest) {
        return res.status(404).json({
          success: false,
          message: "Mock test not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Mock test deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;