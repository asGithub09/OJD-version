const User = require("../models/User");
const Course = require("../models/Course");
const Faculty = require("../models/Faculty");
const MockTest = require("../models/MockTest");
const CourseModule = require("../models/CourseModule");
const CourseLesson = require("../models/CourseLesson");

const getDateValue = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const buildActivity = (items, type, getTitle) => {
  return items
    .map((item) => {
      const updatedAt = getDateValue(item.updatedAt);
      const createdAt = getDateValue(item.createdAt);

      const date = updatedAt || createdAt;

      if (!date) {
        return null;
      }

      return {
        type,
        title: getTitle(item),
        date: date.toISOString(),
      };
    })
    .filter(Boolean);
};

const getAdminStats = async () => {
  const [
    totalStudents,
    activeStudents,
    totalCourses,
    publishedCourses,
    totalFaculty,
    publishedFaculty,
    totalMockTests,
    publishedMockTests,
    totalModules,
    publishedModules,
    totalLessons,
    publishedLessons,
    recentCourses,
    recentFaculty,
    recentMockTests,
    recentModules,
    recentLessons,
  ] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    User.countDocuments({
      role: "STUDENT",
      accountStatus: "ACTIVE",
    }),

    Course.countDocuments(),
    Course.countDocuments({ published: true }),

    Faculty.countDocuments(),
    Faculty.countDocuments({ published: true }),

    MockTest.countDocuments(),
    MockTest.countDocuments({ published: true }),

    CourseModule.countDocuments(),
    CourseModule.countDocuments({ published: true }),

    CourseLesson.countDocuments(),
    CourseLesson.countDocuments({ published: true }),

    Course.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title createdAt updatedAt")
      .lean(),

    Faculty.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("name createdAt updatedAt")
      .lean(),

    MockTest.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title createdAt updatedAt")
      .lean(),

    CourseModule.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title createdAt updatedAt")
      .lean(),

    CourseLesson.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title createdAt updatedAt")
      .lean(),
  ]);

  const activity = [
    ...buildActivity(
      recentCourses,
      "COURSE",
      (item) => item.title || "Course"
    ),

    ...buildActivity(
      recentFaculty,
      "FACULTY",
      (item) => item.name || "Faculty member"
    ),

    ...buildActivity(
      recentMockTests,
      "MOCK_TEST",
      (item) => item.title || "Mock test"
    ),

    ...buildActivity(
      recentModules,
      "MODULE",
      (item) => item.title || "Course module"
    ),

    ...buildActivity(
      recentLessons,
      "LESSON",
      (item) => item.title || "Course lesson"
    ),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 10);

  return {
    students: {
      total: totalStudents,
      active: activeStudents,
    },

    courses: {
      total: totalCourses,
      published: publishedCourses,
    },

    faculty: {
      total: totalFaculty,
      published: publishedFaculty,
    },

    mockTests: {
      total: totalMockTests,
      published: publishedMockTests,
    },

    modules: {
      total: totalModules,
      published: publishedModules,
    },

    lessons: {
      total: totalLessons,
      published: publishedLessons,
    },

    activity,
  };
};

module.exports = {
  getAdminStats,
};
