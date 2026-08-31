const express = require("express");

const {
  getAdminStats,
} = require("../services/adminStatsService");

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
 * ADMIN
 * GET /api/admin/stats
 *
 * Returns real platform statistics and recent activity.
 * ============================================================
 */

router.get(
  "/stats",
  ...adminOnly,
  async (req, res, next) => {
    try {
      const stats = await getAdminStats();

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
