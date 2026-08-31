const mongoose = require("mongoose");

const studentGamificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required."],
      unique: true,
      index: true,
    },

    totalXP: {
      type: Number,
      default: 0,
      min: [0, "Total XP cannot be negative."],
    },

    currentStreak: {
      type: Number,
      default: 0,
      min: [0, "Current streak cannot be negative."],
    },

    longestStreak: {
      type: Number,
      default: 0,
      min: [0, "Longest streak cannot be negative."],
    },

    lastActivityDate: {
      type: Date,
      default: null,
    },

    testsCompleted: {
      type: Number,
      default: 0,
      min: [0, "Tests completed cannot be negative."],
    },

    lessonsCompleted: {
      type: Number,
      default: 0,
      min: [0, "Lessons completed cannot be negative."],
    },
  },
  {
    timestamps: true,
  }
);

studentGamificationSchema.index({
  totalXP: -1,
});

studentGamificationSchema.index({
  currentStreak: -1,
});

const StudentGamification =
  mongoose.model(
    "StudentGamification",
    studentGamificationSchema
  );

module.exports = StudentGamification;
