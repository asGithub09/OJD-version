const CourseModule = require("../models/CourseModule");
const Course = require("../models/Course");

const createCourseModule = async (data) => {
  const course = await Course.findById(data.course);

  if (!course) {
    const error = new Error("Course not found.");
    error.status = 404;
    throw error;
  }

  const module = await CourseModule.create({
    course: data.course,
    title: data.title,
    description: data.description || "",
    displayOrder: Number(data.displayOrder) || 0,
    published: Boolean(data.published),
    isFree: Boolean(data.isFree),
  });

  return module.populate("course", "title slug");
};

const getPublishedCourseModules = async (courseId) => {
  return CourseModule.find({
    course: courseId,
    published: true,
  })
    .populate("course", "title slug")
    .sort({
      displayOrder: 1,
      createdAt: 1,
    });
};

const getAllCourseModules = async (courseId) => {
  return CourseModule.find({
    course: courseId,
  })
    .populate("course", "title slug")
    .sort({
      displayOrder: 1,
      createdAt: 1,
    });
};

const getCourseModuleById = async (id) => {
  return CourseModule.findById(id).populate(
    "course",
    "title slug"
  );
};

const updateCourseModule = async (id, data) => {
  const updates = {};

  const fields = [
    "title",
    "description",
    "published",
    "isFree",
  ];

  fields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (data.displayOrder !== undefined) {
    updates.displayOrder =
      Number(data.displayOrder) || 0;
  }

  if (data.course !== undefined) {
    const course = await Course.findById(data.course);

    if (!course) {
      const error = new Error(
        "Course not found."
      );

      error.status = 404;
      throw error;
    }

    updates.course = data.course;
  }

  return CourseModule.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  ).populate("course", "title slug");
};

const deleteCourseModule = async (id) => {
  return CourseModule.findByIdAndDelete(id);
};

module.exports = {
  createCourseModule,
  getPublishedCourseModules,
  getAllCourseModules,
  getCourseModuleById,
  updateCourseModule,
  deleteCourseModule,
};