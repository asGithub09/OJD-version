const express = require("express");

const {
  startMockTest,
  saveMockTestAttempt,
  submitMockTestAttempt,
  getStudentAttempt,
  getStudentAttempts,
} = require("../services/mockTestAttemptService");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

const studentOnly = [
  authenticate,
  authorizeRoles("STUDENT"),
];

/*
 * ============================================================
 * STUDENT — MOCK TEST ATTEMPTS
 * ============================================================
 */

/*
 * GET
 * /api/mock-test-attempts
 *
 * Student's previous attempts.
 */
router.get(
  "/",
  ...studentOnly,
  async (req, res, next) => {
    try {
      const attempts =
        await getStudentAttempts(
          req.user._id
        );

      res.status(200).json({
        success: true,
        attempts,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * POST
 * /api/mock-test-attempts/start/:mockTestId
 *
 * Start a new test or resume an existing
 * in-progress attempt.
 */
router.post(
  "/start/:mockTestId",
  ...studentOnly,
  async (req, res, next) => {
    try {
      const result =
        await startMockTest(
          req.user._id,
          req.params.mockTestId
        );

      res.status(200).json({
        success: true,
        resumed: result.resumed,
        attempt: result.attempt,
        mockTest: result.mockTest,
        questions: result.questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * GET
 * /api/mock-test-attempts/:attemptId
 *
 * Resume/view a student's own attempt.
 */
router.get(
  "/:attemptId",
  ...studentOnly,
  async (req, res, next) => {
    try {
      const attempt =
        await getStudentAttempt(
          req.user._id,
          req.params.attemptId
        );

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: "Mock test attempt not found.",
        });
      }

      res.status(200).json({
        success: true,
        attempt,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * PUT
 * /api/mock-test-attempts/:attemptId
 *
 * Autosave answers while the student is
 * taking the test.
 */
router.put(
  "/:attemptId",
  ...studentOnly,
  async (req, res, next) => {
    try {
      const attempt =
        await saveMockTestAttempt(
          req.user._id,
          req.params.attemptId,
          req.body
        );

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message:
            "Active mock test attempt not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Progress saved.",
        attempt,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * POST
 * /api/mock-test-attempts/:attemptId/submit
 *
 * Final server-side scoring.
 */
router.post(
  "/:attemptId/submit",
  ...studentOnly,
  async (req, res, next) => {
    try {
      const result =
        await submitMockTestAttempt(
          req.user._id,
          req.params.attemptId,
          req.body
        );

      if (!result) {
        return res.status(404).json({
          success: false,
          message:
            "Active mock test attempt not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Mock test submitted successfully.",
        attempt: result.attempt,
        mockTest: result.mockTest,
        gamification: result.gamification,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

