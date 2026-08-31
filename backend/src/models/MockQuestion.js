const mongoose = require("mongoose");

const mockQuestionSchema = new mongoose.Schema(
  {
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: [true, "Mock test is required."],
      index: true,
    },

    questionText: {
      type: String,
      required: [true, "Question text is required."],
      trim: true,
      minlength: [
        3,
        "Question text must contain at least 3 characters.",
      ],
      maxlength: [
        5000,
        "Question text cannot exceed 5000 characters.",
      ],
    },

    options: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 1000,
        },
      ],
      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length >= 2 &&
            value.length <= 6 &&
            value.every(
              (option) =>
                typeof option === "string" &&
                option.trim().length > 0
            )
          );
        },
        message:
          "A question must contain between 2 and 6 non-empty options.",
      },
      required: [true, "Question options are required."],
    },

    correctOption: {
      type: Number,
      required: [true, "Correct option is required."],
      min: [0, "Correct option cannot be negative."],
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        3000,
        "Explanation cannot exceed 3000 characters.",
      ],
    },

    marks: {
      type: Number,
      default: 1,
      min: [0, "Marks cannot be negative."],
    },

    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, "Negative marks cannot be negative."],
    },

    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        100,
        "Subject cannot exceed 100 characters.",
      ],
    },

    topic: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        200,
        "Topic cannot exceed 200 characters.",
      ],
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative."],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

mockQuestionSchema.index({
  mockTest: 1,
  displayOrder: 1,
});

mockQuestionSchema.index({
  mockTest: 1,
  subject: 1,
});

/*
 * ============================================================
 * QUESTION VALIDATION
 * ============================================================
 *
 * Mongoose 9 validation middleware returns a Promise.
 * No "next" callback is used here.
 */

mockQuestionSchema.pre(
  "validate",
  function () {
    if (
      !Array.isArray(this.options) ||
      this.options.length < 2 ||
      this.options.length > 6
    ) {
      throw new Error(
        "A question must contain between 2 and 6 options."
      );
    }

    if (
      this.correctOption < 0 ||
      this.correctOption >= this.options.length
    ) {
      throw new Error(
        "Correct option must point to an existing option."
      );
    }
  }
);

/*
 * ============================================================
 * UPDATE VALIDATION
 * ============================================================
 */

mockQuestionSchema.pre(
  "findOneAndUpdate",
  function () {
    const update = this.getUpdate();

    const options =
      update.options !== undefined
        ? update.options
        : update.$set?.options;

    const correctOption =
      update.correctOption !== undefined
        ? update.correctOption
        : update.$set?.correctOption;

    if (
      options !== undefined &&
      correctOption !== undefined &&
      (
        !Array.isArray(options) ||
        options.length < 2 ||
        options.length > 6 ||
        Number(correctOption) < 0 ||
        Number(correctOption) >= options.length
      )
    ) {
      throw new Error(
        "Correct option must point to an existing option."
      );
    }
  }
);

const MockQuestion = mongoose.model(
  "MockQuestion",
  mockQuestionSchema
);

module.exports = MockQuestion;
