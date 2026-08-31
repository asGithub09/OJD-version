const mongoose = require("mongoose");

const MockTest = require("../models/MockTest");
const MockQuestion = require("../models/MockQuestion");
const MockTestAttempt = require("../models/MockTestAttempt");
const { updateStudentGamification } = require("./studentGamificationService");

const getPublishedTest = async (mockTestId) => {
  if (!mongoose.Types.ObjectId.isValid(mockTestId)) {
    return null;
  }

  return MockTest.findOne({
    _id: mockTestId,
    published: true,
  });
};

const getTestQuestions = async (mockTestId) => {
  return MockQuestion.find({
    mockTest: mockTestId,
    active: true,
  })
    .select("_id questionText options marks negativeMarks subject topic displayOrder")
    .sort({
      displayOrder: 1,
      createdAt: 1,
    });
};

const sanitizeAnswers = (answers) => {
  if (!Array.isArray(answers)) {
    return [];
  }

  return answers
    .filter(
      (answer) =>
        answer &&
        mongoose.Types.ObjectId.isValid(answer.question)
    )
    .map((answer) => ({
      question: answer.question,
      selectedOption:
        answer.selectedOption === null ||
        answer.selectedOption === undefined ||
        answer.selectedOption === ""
          ? null
          : Number(answer.selectedOption),
      markedForReview: Boolean(
        answer.markedForReview
      ),
      answeredAt:
        answer.answeredAt
          ? new Date(answer.answeredAt)
          : null,
    }));
};

const startMockTest = async (
  studentId,
  mockTestId
) => {
  const mockTest =
    await getPublishedTest(mockTestId);

  if (!mockTest) {
    const error = new Error(
      "Published mock test not found."
    );

    error.status = 404;
    throw error;
  }

  const questions =
    await getTestQuestions(mockTestId);

  if (!questions.length) {
    const error = new Error(
      "This mock test does not have any active questions yet."
    );

    error.status = 400;
    throw error;
  }

  const existingAttempt =
    await MockTestAttempt.findOne({
      student: studentId,
      mockTest: mockTestId,
      status: "IN_PROGRESS",
    }).sort({
      createdAt: -1,
    });

  if (existingAttempt) {
    return {
      attempt: existingAttempt,
      mockTest,
      questions,
      resumed: true,
    };
  }

  const attempt =
    await MockTestAttempt.create({
      student: studentId,
      mockTest: mockTestId,
      status: "IN_PROGRESS",
      startedAt: new Date(),
      answers: [],
    });

  return {
    attempt,
    mockTest,
    questions,
    resumed: false,
  };
};

const saveMockTestAttempt = async (
  studentId,
  attemptId,
  data
) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    return null;
  }

  const attempt =
    await MockTestAttempt.findOne({
      _id: attemptId,
      student: studentId,
      status: "IN_PROGRESS",
    });

  if (!attempt) {
    return null;
  }

  if (data.answers !== undefined) {
    attempt.answers =
      sanitizeAnswers(data.answers);
  }

  if (
    data.timeTakenSeconds !== undefined
  ) {
    const timeTaken =
      Number(data.timeTakenSeconds);

    if (
      Number.isFinite(timeTaken) &&
      timeTaken >= 0
    ) {
      attempt.timeTakenSeconds =
        timeTaken;
    }
  }

  await attempt.save();

  return attempt;
};

const calculateXP = ({
  percentage,
  correctAnswers,
  timeTakenSeconds,
  durationMinutes,
}) => {
  const baseXP =
    Math.max(
      0,
      Math.round(
        Number(percentage || 0) * 2
      )
    );

  const completionXP =
    correctAnswers > 0
      ? Math.min(
          100,
          correctAnswers * 5
        )
      : 0;

  const durationSeconds =
    Number(durationMinutes || 0) * 60;

  const speedBonus =
    durationSeconds > 0 &&
    timeTakenSeconds > 0 &&
    timeTakenSeconds <=
      durationSeconds * 0.7
      ? 25
      : 0;

  return (
    baseXP +
    completionXP +
    speedBonus
  );
};

const submitMockTestAttempt = async (
  studentId,
  attemptId,
  data = {}
) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    return null;
  }

  const attempt =
    await MockTestAttempt.findOne({
      _id: attemptId,
      student: studentId,
      status: "IN_PROGRESS",
    });

  if (!attempt) {
    return null;
  }

  const mockTest =
    await MockTest.findOne({
      _id: attempt.mockTest,
      published: true,
    });

  if (!mockTest) {
    const error = new Error(
      "Mock test is no longer available."
    );

    error.status = 404;
    throw error;
  }

  const questions =
    await MockQuestion.find({
      mockTest: mockTest._id,
      active: true,
    }).sort({
      displayOrder: 1,
      createdAt: 1,
    });

  const submittedAnswers =
    data.answers !== undefined
      ? sanitizeAnswers(data.answers)
      : attempt.answers;

  const answerMap = new Map();

  submittedAnswers.forEach(
    (answer) => {
      answerMap.set(
        String(answer.question),
        answer
      );
    }
  );

  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;
  let score = 0;
  let totalMarks = 0;

  questions.forEach((question) => {
    const marks =
      Number(question.marks) || 0;

    const negativeMarks =
      Number(question.negativeMarks) || 0;

    totalMarks += marks;

    const answer =
      answerMap.get(
        String(question._id)
      );

    const selectedOption =
      answer?.selectedOption;

    if (
      selectedOption === null ||
      selectedOption === undefined ||
      !Number.isInteger(
        Number(selectedOption)
      )
    ) {
      unanswered += 1;
      return;
    }

    if (
      Number(selectedOption) ===
      Number(question.correctOption)
    ) {
      correctAnswers += 1;
      score += marks;
    } else {
      incorrectAnswers += 1;
      score -= negativeMarks;
    }
  });

  const percentage =
    totalMarks > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (score / totalMarks) * 100
          )
        )
      : 0;

  const accuracy =
    correctAnswers +
      incorrectAnswers >
    0
      ? (
          correctAnswers /
          (correctAnswers +
            incorrectAnswers)
        ) * 100
      : 0;

  const submittedAt =
    new Date();

  let timeTakenSeconds =
    Number(
      data.timeTakenSeconds ??
        attempt.timeTakenSeconds ??
        0
    );

  if (
    !Number.isFinite(timeTakenSeconds) ||
    timeTakenSeconds < 0
  ) {
    timeTakenSeconds = 0;
  }

  const calculatedXP =
    calculateXP({
      percentage,
      correctAnswers,
      timeTakenSeconds,
      durationMinutes:
        mockTest.durationMinutes,
    });

  attempt.answers =
    submittedAnswers;

  attempt.status =
    "SUBMITTED";

  attempt.submittedAt =
    submittedAt;

  attempt.timeTakenSeconds =
    timeTakenSeconds;

  attempt.correctAnswers =
    correctAnswers;

  attempt.incorrectAnswers =
    incorrectAnswers;

  attempt.unanswered =
    unanswered;

  attempt.score =
    Math.round(
      score * 100
    ) / 100;

  attempt.totalMarks =
    totalMarks;

  attempt.percentage =
    Math.round(
      percentage * 100
    ) / 100;

  attempt.accuracy =
    Math.round(
      accuracy * 100
    ) / 100;

  attempt.xpEarned =
    calculatedXP;

  await attempt.save();

  const gamification =
    await updateStudentGamification(
      studentId,
      calculatedXP,
      submittedAt
    );

  return {
    attempt,
    mockTest,
    gamification,
  };
};

const getStudentAttempt = async (
  studentId,
  attemptId
) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    return null;
  }

  return MockTestAttempt.findOne({
    _id: attemptId,
    student: studentId,
  }).populate(
    "mockTest",
    "title category examType durationMinutes totalMarks"
  );
};

const getStudentAttempts = async (
  studentId
) => {
  return MockTestAttempt.find({
    student: studentId,
  })
    .populate(
      "mockTest",
      "title category examType durationMinutes totalMarks"
    )
    .sort({
      createdAt: -1,
    });
};

module.exports = {
  startMockTest,
  saveMockTestAttempt,
  submitMockTestAttempt,
  getStudentAttempt,
  getStudentAttempts,
};


