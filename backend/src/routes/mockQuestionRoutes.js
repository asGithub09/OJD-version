const express = require("express");

const {
  createMockQuestion,
  getMockQuestions,
  getMockQuestionById,
  updateMockQuestion,
  deleteMockQuestion,
} = require("../services/mockQuestionService");

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
 * ============================================================
 * ADMIN — MOCK TEST QUESTIONS
 * ============================================================
 */

/*
 * GET
 * /api/mock-tests/:mockTestId/questions
 */
router.get(
  "/:mockTestId/questions",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const questions =
        await getMockQuestions(
          req.params.mockTestId
        );

      res.status(200).json({
        success: true,
        questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * GET
 * /api/mock-tests/:mockTestId/questions/:questionId
 */
router.get(
  "/:mockTestId/questions/:questionId",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const question =
        await getMockQuestionById(
          req.params.mockTestId,
          req.params.questionId
        );

      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Mock question not found.",
        });
      }

      res.status(200).json({
        success: true,
        question,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * POST
 * /api/mock-tests/:mockTestId/questions
 */
router.post(
  "/:mockTestId/questions",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const question =
        await createMockQuestion(
          req.params.mockTestId,
          req.body
        );

      res.status(201).json({
        success: true,
        message:
          "Mock question created successfully.",
        question,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * PUT
 * /api/mock-tests/:mockTestId/questions/:questionId
 */
router.put(
  "/:mockTestId/questions/:questionId",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const question =
        await updateMockQuestion(
          req.params.mockTestId,
          req.params.questionId,
          req.body
        );

      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Mock question not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Mock question updated successfully.",
        question,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * DELETE
 * /api/mock-tests/:mockTestId/questions/:questionId
 */
router.delete(
  "/:mockTestId/questions/:questionId",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const question =
        await deleteMockQuestion(
          req.params.mockTestId,
          req.params.questionId
        );

      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Mock question not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Mock question deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
