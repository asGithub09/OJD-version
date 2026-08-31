const mongoose = require("mongoose");

const mockTestAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required."],
      index: true,
    },

    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: [true, "Mock test is required."],
      index: true,
    },

    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED", "ABANDONED"],
      default: "IN_PROGRESS",
      index: true,
    },

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MockQuestion",
          required: true,
        },

        selectedOption: {
          type: Number,
          default: null,
        },

        markedForReview: {
          type: Boolean,
          default: false,
        },

        answeredAt: {
          type: Date,
          default: null,
        },
      },
    ],

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    timeTakenSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    unanswered: {
      type: Number,
      default: 0,
      min: 0,
    },

    score: {
      type: Number,
      default: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

mockTestAttemptSchema.index({
  student: 1,
  mockTest: 1,
  createdAt: -1,
});

mockTestAttemptSchema.index({
  mockTest: 1,
  status: 1,
});

mockTestAttemptSchema.index({
  student: 1,
  status: 1,
});

const MockTestAttempt = mongoose.model(
  "MockTestAttempt",
  mockTestAttemptSchema
);

module.exports = MockTestAttempt;
