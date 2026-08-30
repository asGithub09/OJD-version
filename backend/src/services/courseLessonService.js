const CourseLesson = require("../models/CourseLesson");
const Course = require("../models/Course");
const CourseModule = require("../models/CourseModule");


/*
 * CREATE LESSON
 */
const createCourseLesson = async (data) => {
  const course = await Course.findById(
    data.course
  );

  if (!course) {
    const error = new Error(
      "Course not found."
    );

    error.status = 404;
    throw error;
  }

  const module =
    await CourseModule.findById(
      data.module
    );

  if (!module) {
    const error = new Error(
      "Course module not found."
    );

    error.status = 404;
    throw error;
  }

  if (
    module.course.toString() !==
    course._id.toString()
  ) {
    const error = new Error(
      "Module does not belong to the selected course."
    );

    error.status = 400;
    throw error;
  }

  const lesson =
    await CourseLesson.create({
      course: data.course,
      module: data.module,

      title: data.title,

      description:
        data.description || "",

      type:
        data.type || "VIDEO",

      content:
        data.content || "",

      thumbnailUrl:
        data.thumbnailUrl || "",

      displayOrder:
        Number(data.displayOrder) || 0,

      duration:
        data.duration || "",

      published:
        Boolean(data.published),

      isFree:
        Boolean(data.isFree),
    });

  return lesson.populate([
    {
      path: "course",
      select: "title slug",
    },
    {
      path: "module",
      select: "title displayOrder",
    },
  ]);
};


/*
 * GET PUBLISHED LESSONS
 *
 * Used later by the student-facing
 * course experience.
 */
const getPublishedCourseLessons = async (
  moduleId
) => {
  return CourseLesson.find({
    module: moduleId,
    published: true,
  })
    .populate(
      "course",
      "title slug"
    )
    .populate(
      "module",
      "title displayOrder"
    )
    .sort({
      displayOrder: 1,
      createdAt: 1,
    });
};


/*
 * GET ALL LESSONS
 *
 * Admin only.
 */
const getAllCourseLessons = async (
  moduleId
) => {
  return CourseLesson.find({
    module: moduleId,
  })
    .populate(
      "course",
      "title slug"
    )
    .populate(
      "module",
      "title displayOrder"
    )
    .sort({
      displayOrder: 1,
      createdAt: 1,
    });
};


/*
 * GET LESSON BY ID
 */
const getCourseLessonById = async (
  id
) => {
  return CourseLesson.findById(id)
    .populate(
      "course",
      "title slug"
    )
    .populate(
      "module",
      "title displayOrder"
    );
};


/*
 * UPDATE LESSON
 */
const updateCourseLesson = async (
  id,
  data
) => {
  const updates = {};

  const fields = [
    "title",
    "description",
    "type",
    "content",
    "thumbnailUrl",
    "duration",
    "published",
    "isFree",
  ];

  fields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (
    data.displayOrder !== undefined
  ) {
    updates.displayOrder =
      Number(data.displayOrder) || 0;
  }

  /*
   * Allow moving a lesson to another module,
   * but validate that the module belongs to
   * the selected course.
   */
  if (data.module !== undefined) {
    const module =
      await CourseModule.findById(
        data.module
      );

    if (!module) {
      const error = new Error(
        "Course module not found."
      );

      error.status = 404;
      throw error;
    }

    const courseId =
      data.course !== undefined
        ? data.course
        : (
            await CourseLesson.findById(id)
          )?.course;

    if (!courseId) {
      const error = new Error(
        "Course not found."
      );

      error.status = 404;
      throw error;
    }

    if (
      module.course.toString() !==
      courseId.toString()
    ) {
      const error = new Error(
        "Module does not belong to the selected course."
      );

      error.status = 400;
      throw error;
    }

    updates.module = data.module;
  }

  if (data.course !== undefined) {
    const course = await Course.findById(
      data.course
    );

    if (!course) {
      const error = new Error(
        "Course not found."
      );

      error.status = 404;
      throw error;
    }

    updates.course = data.course;
  }

  return CourseLesson.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate(
      "course",
      "title slug"
    )
    .populate(
      "module",
      "title displayOrder"
    );
};


/*
 * DELETE LESSON
 */
const deleteCourseLesson = async (
  id
) => {
  return CourseLesson.findByIdAndDelete(id);
};


module.exports = {
  createCourseLesson,
  getPublishedCourseLessons,
  getAllCourseLessons,
  getCourseLessonById,
  updateCourseLesson,
  deleteCourseLesson,
};