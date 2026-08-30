const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required."],
      trim: true,
      minlength: [2, "Faculty name must contain at least 2 characters."],
      maxlength: [100, "Faculty name cannot exceed 100 characters."],
    },

    slug: {
      type: String,
      required: [true, "Faculty slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [120, "Faculty slug cannot exceed 120 characters."],
    },

    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    designation: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        150,
        "Faculty designation cannot exceed 150 characters.",
      ],
    },

    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters."],
    },

    qualification: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Qualification cannot exceed 300 characters."],
    },

    experience: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Experience cannot exceed 100 characters."],
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1500, "Faculty bio cannot exceed 1500 characters."],
    },

    specialization: {
      type: [String],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    published: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative."],
    },
  },
  {
    timestamps: true,
  }
);

facultySchema.index({ published: 1 });
facultySchema.index({ featured: 1 });
facultySchema.index({ displayOrder: 1 });

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;