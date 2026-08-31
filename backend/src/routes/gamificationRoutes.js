const express = require("express");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getStudentGamification,
  getStudentLeaderboard,
} = require("../services/studentGamificationService");

const StudentGamification = require("../models/StudentGamification");

const router = express.Router();

const studentOnly = [
  authenticate,
  authorizeRoles("STUDENT"),
];

/*
 * ============================================================
 * STUDENT GAMIFICATION
 * ============================================================
 */

/*
 * GET
 * /api/gamification/me
 *
 * Returns the authenticated student's XP,
 * streak and completion statistics.
 */
router.get(
  "/me",
  ...studentOnly,
  async (req, res, next) => {
    try {
      let gamification =
        await getStudentGamification(
          req.user._id
        );

      if (!gamification) {
        gamification = {
          student: req.user._id,
          totalXP: 0,
          currentStreak: 0,
          longestStreak: 0,
          testsCompleted: 0,
          lessonsCompleted: 0,
          lastActivityDate: null,
        };
      }

      res.status(200).json({
        success: true,
        gamification,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * GET
 * /api/gamification/leaderboard
 *
 * Publicly safe student leaderboard data.
 * Only student names and gamification statistics
 * are returned by the service.
 */
router.get(
  "/leaderboard",
  ...studentOnly,
  async (req, res, next) => {
    try {
      const leaderboard =
        await getStudentLeaderboard(100);

      const studentId =
        String(req.user._id);

      const rankIndex =
        leaderboard.findIndex(
          (entry) =>
            String(entry.student?._id) ===
            studentId
        );

      res.status(200).json({
        success: true,
        leaderboard,
        rank:
          rankIndex >= 0
            ? rankIndex + 1
            : null,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
