const MockQuestion = require("../models/MockQuestion");
const MockTest = require("../models/MockTest");

const createMockQuestion = async (mockTestId, data) => {
  const mockTest = await MockTest.findById(mockTestId);

  if (!mockTest) {
    const error = new Error("Mock test not found.");
    error.status = 404;
    throw error;
  }

  const question = await MockQuestion.create({
    mockTest: mockTestId,
    questionText: data.questionText,
    options: data.options,
    correctOption: Number(data.correctOption),
    explanation: data.explanation || "",
    marks:
      data.marks !== undefined
        ? Number(data.marks)
        : 1,
    negativeMarks:
      data.negativeMarks !== undefined
        ? Number(data.negativeMarks)
        : 0,
    subject: data.subject || "",
    topic: data.topic || "",
    displayOrder:
      data.displayOrder !== undefined
        ? Number(data.displayOrder)
        : 0,
    active:
      data.active !== undefined
        ? Boolean(data.active)
        : true,
  });

  await MockTest.findByIdAndUpdate(
    mockTestId,
    {
      questionCount: await MockQuestion.countDocuments({
        mockTest: mockTestId,
        active: true,
      }),
    }
  );

  return question;
};

const getMockQuestions = async (mockTestId) => {
  return MockQuestion.find({
    mockTest: mockTestId,
  }).sort({
    displayOrder: 1,
    createdAt: 1,
  });
};

const getMockQuestionById = async (
  mockTestId,
  questionId
) => {
  return MockQuestion.findOne({
    _id: questionId,
    mockTest: mockTestId,
  });
};

const updateMockQuestion = async (
  mockTestId,
  questionId,
  data
) => {
  const updates = {};

  const fields = [
    "questionText",
    "options",
    "correctOption",
    "explanation",
    "marks",
    "negativeMarks",
    "subject",
    "topic",
    "displayOrder",
    "active",
  ];

  fields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  const numericFields = [
    "correctOption",
    "marks",
    "negativeMarks",
    "displayOrder",
  ];

  numericFields.forEach((field) => {
    if (updates[field] !== undefined) {
      updates[field] = Number(updates[field]);
    }
  });

  const question =
    await MockQuestion.findOneAndUpdate(
      {
        _id: questionId,
        mockTest: mockTestId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

  if (question) {
    await MockTest.findByIdAndUpdate(
      mockTestId,
      {
        questionCount:
          await MockQuestion.countDocuments({
            mockTest: mockTestId,
            active: true,
          }),
      }
    );
  }

  return question;
};

const deleteMockQuestion = async (
  mockTestId,
  questionId
) => {
  const question =
    await MockQuestion.findOneAndDelete({
      _id: questionId,
      mockTest: mockTestId,
    });

  if (question) {
    await MockTest.findByIdAndUpdate(
      mockTestId,
      {
        questionCount:
          await MockQuestion.countDocuments({
            mockTest: mockTestId,
            active: true,
          }),
      }
    );
  }

  return question;
};

module.exports = {
  createMockQuestion,
  getMockQuestions,
  getMockQuestionById,
  updateMockQuestion,
  deleteMockQuestion,
};
