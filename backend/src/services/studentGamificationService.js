const mongoose = require("mongoose");

const StudentGamification = require("../models/StudentGamification");

const getStartOfDay = (date = new Date()) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const getDayDifference = (fromDate, toDate) => {
  const from = getStartOfDay(fromDate);
  const to = getStartOfDay(toDate);

  return Math.round(
    (to.getTime() - from.getTime()) /
      (24 * 60 * 60 * 1000)
  );
};

const updateStudentGamification = async (
  studentId,
  xpEarned = 0,
  activityDate = new Date()
) => {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student ID.");
  }

  const safeXP =
    Number.isFinite(Number(xpEarned)) &&
    Number(xpEarned) > 0
      ? Math.round(Number(xpEarned))
      : 0;

  const activity = new Date(activityDate);

  if (Number.isNaN(activity.getTime())) {
    throw new Error("Invalid activity date.");
  }

  let gamification =
    await StudentGamification.findOne({
      student: studentId,
    });

  if (!gamification) {
    gamification =
      await StudentGamification.create({
        student: studentId,
        totalXP: safeXP,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: activity,
        testsCompleted: 1,
      });

    return gamification;
  }

  const previousActivity =
    gamification.lastActivityDate;

  let currentStreak =
    Number(gamification.currentStreak) || 0;

  let longestStreak =
    Number(gamification.longestStreak) || 0;

  if (!previousActivity) {
    currentStreak = 1;
  } else {
    const difference = getDayDifference(
      previousActivity,
      activity
    );

    if (difference === 0) {
      // Same day: preserve the existing streak.
    } else if (difference === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  }

  longestStreak = Math.max(
    longestStreak,
    currentStreak
  );

  gamification.totalXP += safeXP;
  gamification.currentStreak = currentStreak;
  gamification.longestStreak = longestStreak;
  gamification.lastActivityDate = activity;
  gamification.testsCompleted += 1;

  await gamification.save();

  return gamification;
};

const getStudentGamification = async (
  studentId
) => {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return null;
  }

  return StudentGamification.findOne({
    student: studentId,
  });
};

const getStudentLeaderboard = async (
  limit = 100
) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    100
  );

  return StudentGamification.find()
    .sort({
      totalXP: -1,
      longestStreak: -1,
      _id: 1,
    })
    .limit(safeLimit)
    .populate(
      "student",
      "name"
    )
    .lean();
};

module.exports = {
  updateStudentGamification,
  getStudentGamification,
  getStudentLeaderboard,
};
