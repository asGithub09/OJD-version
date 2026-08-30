const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
      index: true,
    },

    destination: {
      type: String,
      required: [true, "OTP destination is required."],
      trim: true,
      lowercase: true,
    },

    purpose: {
      type: String,
      required: [true, "OTP purpose is required."],
      enum: {
        values: [
          "EMAIL_VERIFICATION",
          "PHONE_VERIFICATION",
          "PASSWORD_RESET",
          "LOGIN_VERIFICATION",
        ],
        message: "Invalid OTP purpose.",
      },
    },

    hashedOtp: {
      type: String,
      required: [true, "Hashed OTP is required."],
      select: false,
    },

    expiresAt: {
  type: Date,
  required: [true, "OTP expiration time is required."],
},

    attempts: {
      type: Number,
      default: 0,
      min: [0, "OTP attempts cannot be negative."],
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: [1, "Maximum OTP attempts must be at least 1."],
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * MongoDB automatically removes expired OTP documents.
 *
 * The TTL monitor runs periodically, so expiration should still
 * be enforced by application logic when verifying an OTP.
 */
otpSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

/*
 * Helps locate active OTP records for a specific user and purpose.
 */
otpSchema.index({
  userId: 1,
  purpose: 1,
  verified: 1,
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;