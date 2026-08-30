const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required."],
      trim: true,
      minlength: [
        3,
        "Course title must contain at least 3 characters.",
      ],
      maxlength: [
        200,
        "Course title cannot exceed 200 characters.",
      ],
    },

    slug: {
      type: String,
      required: [true, "Course slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [
        220,
        "Course slug cannot exceed 220 characters.",
      ],
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        300,
        "Short description cannot exceed 300 characters.",
      ],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        5000,
        "Course description cannot exceed 5000 characters.",
      ],
    },

    category: {
      type: String,
      required: [true, "Course category is required."],
      trim: true,
      maxlength: [
        100,
        "Course category cannot exceed 100 characters.",
      ],
    },

    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },

    faculty: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
      },
    ],

    level: {
      type: String,
      enum: [
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED",
        "ALL_LEVELS",
      ],
      default: "ALL_LEVELS",
    },

    duration: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        100,
        "Duration cannot exceed 100 characters.",
      ],
    },

    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative."],
    },

    originalPrice: {
      type: Number,
      default: 0,
      min: [0, "Original price cannot be negative."],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    published: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative."],
    },
  },
  {
    timestamps: true,
  }
);

/*
 * INDEXES
 */

courseSchema.index({ published: 1 });
courseSchema.index({ featured: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ displayOrder: 1 });

/*
 * VALIDATE COURSE PRICE BEFORE SAVE
 *
 * Mongoose 9 style middleware:
 * no next() callback.
 */

courseSchema.pre("save", function () {
  if (
    this.originalPrice > 0 &&
    this.price > this.originalPrice
  ) {
    throw new Error(
      "Course price cannot exceed original price."
    );
  }
});

/*
 * VALIDATE COURSE PRICE BEFORE UPDATE
 *
 * Mongoose 9 style middleware:
 * no next() callback.
 */

courseSchema.pre(
  "findOneAndUpdate",
  function () {
    const update = this.getUpdate() || {};

    const price =
      update.price !== undefined
        ? update.price
        : update.$set?.price;

    const originalPrice =
      update.originalPrice !== undefined
        ? update.originalPrice
        : update.$set?.originalPrice;

    if (
      price !== undefined &&
      originalPrice !== undefined &&
      Number(originalPrice) > 0 &&
      Number(price) > Number(originalPrice)
    ) {
      throw new Error(
        "Course price cannot exceed original price."
      );
    }
  }
);

const Course = mongoose.model(
  "Course",
  courseSchema
);

module.exports = Course;