const MockTest = require("../models/MockTest");

const createMockTest = async (data) => {
  const mockTest = await MockTest.create({
    title: data.title,
    slug: data.slug,
    description: data.description || "",
    category: data.category,
    examType: data.examType || "",
    thumbnailUrl: data.thumbnailUrl || "",
    durationMinutes: Number(data.durationMinutes),
    questionCount: Number(data.questionCount) || 0,
    totalMarks: Number(data.totalMarks) || 0,
    passingMarks: Number(data.passingMarks) || 0,
    price: Number(data.price) || 0,
    originalPrice: Number(data.originalPrice) || 0,
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    displayOrder: Number.isFinite(data.displayOrder)
      ? data.displayOrder
      : 0,
  });

  return mockTest;
};

const getPublishedMockTests = async () => {
  return MockTest.find({
    published: true,
  }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
};

const getFeaturedMockTests = async () => {
  return MockTest.find({
    published: true,
    featured: true,
  }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
};

const getAllMockTests = async () => {
  return MockTest.find().sort({
    displayOrder: 1,
    createdAt: -1,
  });
};

const getMockTestById = async (id) => {
  return MockTest.findById(id);
};

const updateMockTest = async (id, data) => {
  const updates = {};

  const fields = [
    "title",
    "slug",
    "description",
    "category",
    "examType",
    "thumbnailUrl",
    "durationMinutes",
    "questionCount",
    "totalMarks",
    "passingMarks",
    "price",
    "originalPrice",
    "featured",
    "published",
    "displayOrder",
  ];

  fields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  const numericFields = [
    "durationMinutes",
    "questionCount",
    "totalMarks",
    "passingMarks",
    "price",
    "originalPrice",
    "displayOrder",
  ];

  numericFields.forEach((field) => {
    if (updates[field] !== undefined) {
      updates[field] = Number(updates[field]);
    }
  });

  return MockTest.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteMockTest = async (id) => {
  return MockTest.findByIdAndDelete(id);
};

module.exports = {
  createMockTest,
  getPublishedMockTests,
  getFeaturedMockTests,
  getAllMockTests,
  getMockTestById,
  updateMockTest,
  deleteMockTest,
};