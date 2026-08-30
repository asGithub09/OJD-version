const mongoose = require("mongoose");

const courseModuleSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required."],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Module title is required."],
      trim: true,
      minlength: [
        2,
        "Module title must contain at least 2 characters.",
      ],
      maxlength: [
        200,
        "Module title cannot exceed 200 characters.",
      ],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        2000,
        "Module description cannot exceed 2000 characters.",
      ],
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: [
        0,
        "Display order cannot be negative.",
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

courseModuleSchema.index({
  course: 1,
  displayOrder: 1,
});

courseModuleSchema.index({
  course: 1,
  published: 1,
});

/*
 * MODEL
 */

const CourseModule = mongoose.model(
  "CourseModule",
  courseModuleSchema
);

module.exports = CourseModule;