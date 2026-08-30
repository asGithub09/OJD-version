const mongoose = require("mongoose");

const courseLessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required."],
      index: true,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModule",
      required: [true, "Module is required."],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Lesson title is required."],
      trim: true,
      minlength: [
        2,
        "Lesson title must contain at least 2 characters.",
      ],
      maxlength: [
        200,
        "Lesson title cannot exceed 200 characters.",
      ],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        5000,
        "Lesson description cannot exceed 5000 characters.",
      ],
    },

    type: {
      type: String,
      enum: {
        values: [
          "VIDEO",
          "ARTICLE",
          "PDF",
          "QUIZ",
          "ASSIGNMENT",
          "CHALLENGE",
        ],
        message: "Invalid lesson type.",
      },
      default: "VIDEO",
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: [
        0,
        "Display order cannot be negative.",
      ],
    },

    duration: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        50,
        "Duration cannot exceed 50 characters.",
      ],
    },

    published: {
      type: Boolean,
      default: false,
    },

    isFree: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * INDEXES
 */

courseLessonSchema.index({
  course: 1,
  module: 1,
  displayOrder: 1,
});

courseLessonSchema.index({
  module: 1,
  published: 1,
});

courseLessonSchema.index({
  course: 1,
  type: 1,
});

/*
 * MODEL
 */

const CourseLesson = mongoose.model(
  "CourseLesson",
  courseLessonSchema
);

module.exports = CourseLesson;