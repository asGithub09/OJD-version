const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required."],
      unique: true,
      trim: true,
      match: [
        /^\+?[1-9]\d{7,14}$/,
        "Please provide a valid phone number.",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must contain at least 8 characters."],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"],
        message: "Invalid user role.",
      },
      default: "STUDENT",
    },

    accountStatus: {
      type: String,
      enum: {
        values: [
          "PENDING_VERIFICATION",
          "ACTIVE",
          "SUSPENDED",
          "DISABLED",
        ],
        message: "Invalid account status.",
      },
      default: "PENDING_VERIFICATION",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    phoneVerifiedAt: {
      type: Date,
      default: null,
    },

    profile: {
      photoUrl: {
        type: String,
        default: "",
        trim: true,
      },

      bio: {
        type: String,
        default: "",
        trim: true,
        maxlength: [1000, "Bio cannot exceed 1000 characters."],
      },

      subject: {
        type: String,
        default: "",
        trim: true,
        maxlength: [100, "Subject cannot exceed 100 characters."],
      },

      credentials: {
        type: String,
        default: "",
        trim: true,
        maxlength: [500, "Credentials cannot exceed 500 characters."],
      },
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;