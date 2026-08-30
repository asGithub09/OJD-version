const mongoose = require("mongoose");

const StudentCourseProgress = require(
  "../models/StudentCourseProgress"
);

const Course = require("../models/Course");
const CourseModule = require("../models/CourseModule");
const CourseLesson = require("../models/CourseLesson");

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getPublishedLessons(courseId) {
  const modules = await CourseModule.find({
    course: courseId,
    published: true,
  })
    .select("_id")
    .sort({
      displayOrder: 1,
      createdAt: 1,
    })
    .lean();

  if (modules.length === 0) {
    return [];
  }

  const moduleIds = modules.map(
    (module) => module._id
  );

  return CourseLesson.find({
    module: {
      $in: moduleIds,
    },
    course: courseId,
    published: true,
  })
    .select(
      "_id module title description displayOrder"
    )
    .sort({
      displayOrder: 1,
      createdAt: 1,
    })
    .lean();
}

function calculateProgress(
  completedLessonIds,
  lessons
) {
  if (!lessons.length) {
    return 0;
  }

  const completedSet =
    new Set(
      completedLessonIds.map((id) =>
        String(id)
      )
    );

  const completedCount =
    lessons.filter((lesson) =>
      completedSet.has(
        String(lesson._id)
      )
    ).length;

  return Math.round(
    (completedCount /
      lessons.length) *
      100
  );
}

/*
 * ============================================================
 * GET COURSE PROGRESS
 * ============================================================
 */

async function getCourseProgress(
  studentId,
  courseId
) {
  if (
    !isValidObjectId(studentId) ||
    !isValidObjectId(courseId)
  ) {
    throw new Error(
      "Invalid student or course ID."
    );
  }

  const course =
    await Course.findOne({
      _id: courseId,
      published: true,
    }).lean();

  if (!course) {
    throw new Error(
      "Course not found or it is not published."
    );
  }

  const lessons =
    await getPublishedLessons(
      courseId
    );

  const progress =
    await StudentCourseProgress.findOne({
      student: studentId,
      course: courseId,
    }).lean();

  const completedLessons =
    progress?.completedLessons || [];

  const completedLessonIds =
    completedLessons.map(
      (item) => item.lesson
    );

  const progressPercentage =
    calculateProgress(
      completedLessonIds,
      lessons
    );

  const completed =
    lessons.length > 0 &&
    progressPercentage === 100;

  return {
    courseId: String(courseId),

    totalLessons:
      lessons.length,

    completedLessons:
      completedLessonIds.length,

    progressPercentage,

    completed,

    lastLesson:
      progress?.lastLesson || null,

    completedAt:
      completed
        ? progress?.completedAt || null
        : null,

    completedLessonIds:
      completedLessonIds.map(
        (id) => String(id)
      ),
  };
}

/*
 * ============================================================
 * UPDATE LAST LESSON
 * ============================================================
 */

async function updateLastLesson(
  studentId,
  courseId,
  lessonId
) {
  if (
    !isValidObjectId(studentId) ||
    !isValidObjectId(courseId) ||
    !isValidObjectId(lessonId)
  ) {
    throw new Error(
      "Invalid student, course, or lesson ID."
    );
  }

  const course =
    await Course.findOne({
      _id: courseId,
      published: true,
    }).lean();

  if (!course) {
    throw new Error(
      "Course not found or it is not published."
    );
  }

  const lesson =
    await CourseLesson.findOne({
      _id: lessonId,
      course: courseId,
      published: true,
    }).lean();

  if (!lesson) {
    throw new Error(
      "Lesson not found or it is not published."
    );
  }

  const progress =
    await StudentCourseProgress.findOneAndUpdate(
      {
        student: studentId,
        course: courseId,
      },
      {
        $set: {
          lastLesson: lessonId,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

  return progress;
}

/*
 * ============================================================
 * COMPLETE LESSON
 * ============================================================
 */

async function completeLesson(
  studentId,
  courseId,
  lessonId
) {
  if (
    !isValidObjectId(studentId) ||
    !isValidObjectId(courseId) ||
    !isValidObjectId(lessonId)
  ) {
    throw new Error(
      "Invalid student, course, or lesson ID."
    );
  }

  const course =
    await Course.findOne({
      _id: courseId,
      published: true,
    }).lean();

  if (!course) {
    throw new Error(
      "Course not found or it is not published."
    );
  }

  const lesson =
    await CourseLesson.findOne({
      _id: lessonId,
      course: courseId,
      published: true,
    }).lean();

  if (!lesson) {
    throw new Error(
      "Lesson not found or it is not published."
    );
  }

  const lessons =
    await getPublishedLessons(
      courseId
    );

  const now = new Date();

  let progress =
    await StudentCourseProgress.findOne({
      student: studentId,
      course: courseId,
    });

  if (!progress) {
    progress =
      new StudentCourseProgress({
        student: studentId,
        course: courseId,
        completedLessons: [],
      });
  }

  const alreadyCompleted =
    progress.completedLessons.some(
      (item) =>
        String(item.lesson) ===
        String(lessonId)
    );

  if (!alreadyCompleted) {
    progress.completedLessons.push({
      lesson: lessonId,
      completedAt: now,
    });
  }

  progress.lastLesson =
    lessonId;

  const completedLessonIds =
    progress.completedLessons.map(
      (item) => item.lesson
    );

  progress.progressPercentage =
    calculateProgress(
      completedLessonIds,
      lessons
    );

  if (
    progress.progressPercentage ===
    100
  ) {
    progress.completedAt =
      progress.completedAt ||
      now;
  } else {
    progress.completedAt =
      null;
  }

  await progress.save();

  return {
    courseId: String(courseId),

    lessonId: String(lessonId),

    totalLessons:
      lessons.length,

    completedLessons:
      progress.completedLessons.length,

    progressPercentage:
      progress.progressPercentage,

    completed:
      progress.progressPercentage ===
      100,

    lastLesson:
      progress.lastLesson,

    completedAt:
      progress.completedAt,
  };
}

/*
 * ============================================================
 * UNCOMPLETE LESSON
 * ============================================================
 */

async function uncompleteLesson(
  studentId,
  courseId,
  lessonId
) {
  if (
    !isValidObjectId(studentId) ||
    !isValidObjectId(courseId) ||
    !isValidObjectId(lessonId)
  ) {
    throw new Error(
      "Invalid student, course, or lesson ID."
    );
  }

  const progress =
    await StudentCourseProgress.findOne({
      student: studentId,
      course: courseId,
    });

  if (!progress) {
    return getCourseProgress(
      studentId,
      courseId
    );
  }

  progress.completedLessons =
    progress.completedLessons.filter(
      (item) =>
        String(item.lesson) !==
        String(lessonId)
    );

  const lessons =
    await getPublishedLessons(
      courseId
    );

  const completedLessonIds =
    progress.completedLessons.map(
      (item) => item.lesson
    );

  progress.progressPercentage =
    calculateProgress(
      completedLessonIds,
      lessons
    );

  progress.completedAt =
    progress.progressPercentage ===
    100
      ? progress.completedAt ||
        new Date()
      : null;

  await progress.save();

  return {
    courseId: String(courseId),

    lessonId: String(lessonId),

    totalLessons:
      lessons.length,

    completedLessons:
      progress.completedLessons.length,

    progressPercentage:
      progress.progressPercentage,

    completed:
      progress.progressPercentage ===
      100,

    lastLesson:
      progress.lastLesson,

    completedAt:
      progress.completedAt,
  };
}

/*
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {
  getCourseProgress,
  updateLastLesson,
  completeLesson,
  uncompleteLesson,
};