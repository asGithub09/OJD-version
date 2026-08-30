const Course = require("../models/Course");

/*
 * Convert MongoDB duplicate-key errors into
 * clean application-level errors.
 */
const handleCourseError = (error) => {
  if (error?.code === 11000) {
    const duplicateField =
      Object.keys(error.keyPattern || {})[0] ||
      "field";

    if (duplicateField === "slug") {
      const duplicateError = new Error(
        "A course with this slug already exists. Please choose a different slug."
      );

      duplicateError.status = 409;
      duplicateError.code = "COURSE_SLUG_EXISTS";

      return duplicateError;
    }

    const duplicateError = new Error(
      `A course with this ${duplicateField} already exists.`
    );

    duplicateError.status = 409;
    duplicateError.code = "COURSE_DUPLICATE";

    return duplicateError;
  }

  return error;
};


/*
 * CREATE COURSE
 */
const createCourse = async (data) => {
  try {
    const course = await Course.create({
      title: data.title,
      slug: data.slug,
      shortDescription:
        data.shortDescription || "",
      description:
        data.description || "",
      category: data.category,
      thumbnailUrl:
        data.thumbnailUrl || "",

      faculty: Array.isArray(data.faculty)
        ? data.faculty
        : [],

      level:
        data.level || "ALL_LEVELS",

      duration:
        data.duration || "",

      price:
        Number(data.price) || 0,

      originalPrice:
        Number(data.originalPrice) || 0,

      featured:
        Boolean(data.featured),

      published:
        Boolean(data.published),

      displayOrder:
        Number.isFinite(
          Number(data.displayOrder)
        )
          ? Number(data.displayOrder)
          : 0,
    });

    return course;
  } catch (error) {
    throw handleCourseError(error);
  }
};


/*
 * GET PUBLISHED COURSES
 *
 * Public-facing course list.
 */
const getPublishedCourses = async () => {
  return Course.find({
    published: true,
  })
    .populate(
      "faculty",
      "name photoUrl designation subject experience"
    )
    .sort({
      displayOrder: 1,
      createdAt: -1,
    });
};


/*
 * GET FEATURED COURSES
 *
 * Public-facing featured courses.
 */
const getFeaturedCourses = async () => {
  return Course.find({
    published: true,
    featured: true,
  })
    .populate(
      "faculty",
      "name photoUrl designation subject experience"
    )
    .sort({
      displayOrder: 1,
      createdAt: -1,
    });
};


/*
 * GET ALL COURSES
 *
 * Admin only.
 * Includes drafts and unpublished courses.
 */
const getAllCourses = async () => {
  return Course.find()
    .populate(
      "faculty",
      "name photoUrl designation subject experience"
    )
    .sort({
      displayOrder: 1,
      createdAt: -1,
    });
};


/*
 * GET COURSE BY ID
 */
const getCourseById = async (id) => {
  return Course.findById(id).populate(
    "faculty",
    "name photoUrl designation subject experience"
  );
};


/*
 * UPDATE COURSE
 */
const updateCourse = async (id, data) => {
  try {
    const updates = {};

    const fields = [
      "title",
      "slug",
      "shortDescription",
      "description",
      "category",
      "thumbnailUrl",
      "level",
      "duration",
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

    if (data.faculty !== undefined) {
      updates.faculty =
        Array.isArray(data.faculty)
          ? data.faculty
          : [];
    }

    if (updates.price !== undefined) {
      updates.price =
        Number(updates.price);
    }

    if (
      updates.originalPrice !== undefined
    ) {
      updates.originalPrice =
        Number(updates.originalPrice);
    }

    if (
      updates.displayOrder !== undefined
    ) {
      updates.displayOrder =
        Number(updates.displayOrder);
    }

    const course =
      await Course.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "faculty",
        "name photoUrl designation subject experience"
      );

    return course;
  } catch (error) {
    throw handleCourseError(error);
  }
};


/*
 * DELETE COURSE
 */
const deleteCourse = async (id) => {
  return Course.findByIdAndDelete(id);
};


module.exports = {
  createCourse,
  getPublishedCourses,
  getFeaturedCourses,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};