const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Mock test title is required."],
      trim: true,
      minlength: [
        3,
        "Mock test title must contain at least 3 characters.",
      ],
      maxlength: [
        200,
        "Mock test title cannot exceed 200 characters.",
      ],
    },

    slug: {
      type: String,
      required: [true, "Mock test slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [
        220,
        "Mock test slug cannot exceed 220 characters.",
      ],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        2000,
        "Mock test description cannot exceed 2000 characters.",
      ],
    },

    category: {
      type: String,
      required: [true, "Mock test category is required."],
      trim: true,
      maxlength: [
        100,
        "Mock test category cannot exceed 100 characters.",
      ],
    },

    examType: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        100,
        "Exam type cannot exceed 100 characters.",
      ],
    },

    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },

    durationMinutes: {
      type: Number,
      required: [true, "Test duration is required."],
      min: [1, "Test duration must be at least 1 minute."],
      max: [
        1440,
        "Test duration cannot exceed 1440 minutes.",
      ],
    },

    questionCount: {
      type: Number,
      default: 0,
      min: [0, "Question count cannot be negative."],
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: [0, "Total marks cannot be negative."],
    },

    passingMarks: {
      type: Number,
      default: 0,
      min: [0, "Passing marks cannot be negative."],
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

mockTestSchema.index({ published: 1 });
mockTestSchema.index({ featured: 1 });
mockTestSchema.index({ category: 1 });
mockTestSchema.index({ examType: 1 });
mockTestSchema.index({ displayOrder: 1 });

mockTestSchema.pre("save", function () {
  if (this.passingMarks > this.totalMarks) {
    throw new Error(
      "Passing marks cannot exceed total marks."
    );
  }

  if (
    this.originalPrice > 0 &&
    this.price > this.originalPrice
  ) {
    throw new Error(
      "Mock test price cannot exceed original price."
    );
  }
});

mockTestSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  const totalMarks =
    update.totalMarks !== undefined
      ? update.totalMarks
      : update.$set?.totalMarks;

  const passingMarks =
    update.passingMarks !== undefined
      ? update.passingMarks
      : update.$set?.passingMarks;

  const price =
    update.price !== undefined
      ? update.price
      : update.$set?.price;

  const originalPrice =
    update.originalPrice !== undefined
      ? update.originalPrice
      : update.$set?.originalPrice;

  if (
    totalMarks !== undefined &&
    passingMarks !== undefined &&
    Number(passingMarks) > Number(totalMarks)
  ) {
    throw new Error(
      "Passing marks cannot exceed total marks."
    );
  }

  if (
    price !== undefined &&
    originalPrice !== undefined &&
    Number(originalPrice) > 0 &&
    Number(price) > Number(originalPrice)
  ) {
    throw new Error(
      "Mock test price cannot exceed original price."
    );
  }
});
const MockTest = mongoose.model(
  "MockTest",
  mockTestSchema
);

module.exports = MockTest;

