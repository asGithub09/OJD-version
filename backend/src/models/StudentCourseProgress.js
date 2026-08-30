const mongoose = require("mongoose");

const completedLessonSchema =
  new mongoose.Schema(
    {
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseLesson",
        required: true,
      },

      completedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  );

const studentCourseProgressSchema =
  new mongoose.Schema(
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Student is required.",
        ],
        index: true,
      },

      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [
          true,
          "Course is required.",
        ],
        index: true,
      },

      completedLessons: {
        type: [
          completedLessonSchema,
        ],
        default: [],
      },

      lastLesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseLesson",
        default: null,
      },

      progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

/*
 * ============================================================
 * ONE PROGRESS RECORD PER STUDENT + COURSE
 * ============================================================
 */

studentCourseProgressSchema.index(
  {
    student: 1,
    course: 1,
  },
  {
    unique: true,
  }
);

/*
 * ============================================================
 * MODEL
 * ============================================================
 */

const StudentCourseProgress =
  mongoose.model(
    "StudentCourseProgress",
    studentCourseProgressSchema
  );

module.exports =
  StudentCourseProgress;