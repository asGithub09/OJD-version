const Faculty = require("../models/Faculty");

const createFaculty = async (data) => {
  const faculty = await Faculty.create({
    name: data.name,
    slug: data.slug,
    photoUrl: data.photoUrl || "",
    designation: data.designation || "",
    subject: data.subject || "",
    qualification: data.qualification || "",
    experience: data.experience || "",
    bio: data.bio || "",
    specialization: Array.isArray(data.specialization)
      ? data.specialization
      : [],
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    displayOrder: Number.isFinite(data.displayOrder)
      ? data.displayOrder
      : 0,
  });

  return faculty;
};

const getPublishedFaculty = async () => {
  return Faculty.find({
    published: true,
  }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
};

const getAllFaculty = async () => {
  return Faculty.find().sort({
    displayOrder: 1,
    createdAt: -1,
  });
};

const getFacultyById = async (id) => {
  return Faculty.findById(id);
};

const updateFaculty = async (id, data) => {
  const updates = {};

  const fields = [
    "name",
    "slug",
    "photoUrl",
    "designation",
    "subject",
    "qualification",
    "experience",
    "bio",
    "featured",
    "published",
    "displayOrder",
  ];

  fields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (data.specialization !== undefined) {
    updates.specialization = Array.isArray(data.specialization)
      ? data.specialization
      : [];
  }

  return Faculty.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteFaculty = async (id) => {
  return Faculty.findByIdAndDelete(id);
};

module.exports = {
  createFaculty,
  getPublishedFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};