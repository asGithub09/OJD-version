const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const OTP = require("../models/OTP");

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

const SUPPORTED_PURPOSES = [
  "EMAIL_VERIFICATION",
  "PHONE_VERIFICATION",
  "PASSWORD_RESET",
  "LOGIN_VERIFICATION",
];

const generateOTP = () => {
  const minimum = 10 ** (OTP_LENGTH - 1);
  const maximum = 10 ** OTP_LENGTH;

  return crypto
    .randomInt(minimum, maximum)
    .toString()
    .padStart(OTP_LENGTH, "0");
};

const hashOTP = async (otp) => {
  if (!otp || typeof otp !== "string") {
    throw new Error("OTP is required for hashing.");
  }

  return bcrypt.hash(otp, 12);
};

const verifyOTPHash = async (otp, hashedOtp) => {
  if (!otp || !hashedOtp) {
    return false;
  }

  return bcrypt.compare(otp, hashedOtp);
};

const validatePurpose = (purpose) => {
  if (!SUPPORTED_PURPOSES.includes(purpose)) {
    throw new Error("Invalid OTP purpose.");
  }
};

const normalizeDestination = (destination, purpose) => {
  if (!destination || typeof destination !== "string") {
    throw new Error("OTP destination is required.");
  }

  const normalized = destination.trim();

  if (
    purpose === "EMAIL_VERIFICATION" ||
    purpose === "PASSWORD_RESET"
  ) {
    return normalized.toLowerCase();
  }

  return normalized;
};

const invalidatePreviousOTPs = async (userId, purpose) => {
  await OTP.updateMany(
    {
      userId,
      purpose,
      verified: false,
    },
    {
      $set: {
        verified: true,
        verifiedAt: new Date(),
      },
    }
  );
};

const checkResendCooldown = async (userId, purpose) => {
  const latestOTP = await OTP.findOne({
    userId,
    purpose,
  }).sort({ createdAt: -1 });

  if (!latestOTP) {
    return {
      allowed: true,
      remainingSeconds: 0,
    };
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - latestOTP.createdAt.getTime()) / 1000
  );

  const remainingSeconds =
    RESEND_COOLDOWN_SECONDS - elapsedSeconds;

  if (remainingSeconds > 0) {
    return {
      allowed: false,
      remainingSeconds,
    };
  }

  return {
    allowed: true,
    remainingSeconds: 0,
  };
};

const createOTP = async ({
  userId,
  destination,
  purpose,
  enforceCooldown = true,
}) => {
  validatePurpose(purpose);

  if (!userId) {
    throw new Error("User ID is required.");
  }

  const normalizedDestination = normalizeDestination(
    destination,
    purpose
  );

  if (enforceCooldown) {
    const cooldown = await checkResendCooldown(
      userId,
      purpose
    );

    if (!cooldown.allowed) {
      const error = new Error(
        `Please wait ${cooldown.remainingSeconds} seconds before requesting another OTP.`
      );

      error.code = "OTP_RESEND_COOLDOWN";
      error.remainingSeconds = cooldown.remainingSeconds;

      throw error;
    }
  }

  await invalidatePreviousOTPs(userId, purpose);

  const plainOTP = generateOTP();
  const hashedOtp = await hashOTP(plainOTP);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  const otpRecord = await OTP.create({
    userId,
    destination: normalizedDestination,
    purpose,
    hashedOtp,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_OTP_ATTEMPTS,
    verified: false,
  });

  return {
    otp: plainOTP,
    otpId: otpRecord._id,
    expiresAt,
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
  };
};

const verifyOTP = async ({
  userId,
  otp,
  purpose,
}) => {
  validatePurpose(purpose);

  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!otp || typeof otp !== "string") {
    throw new Error("OTP is required.");
  }

  const normalizedOTP = otp.trim();

  if (!/^\d{6}$/.test(normalizedOTP)) {
    throw new Error("OTP must contain exactly 6 digits.");
  }

  const otpRecord = await OTP.findOne({
    userId,
    purpose,
    verified: false,
  })
    .sort({ createdAt: -1 })
    .select("+hashedOtp");

  if (!otpRecord) {
    const error = new Error(
      "No active OTP verification request was found."
    );

    error.code = "OTP_NOT_FOUND";

    throw error;
  }

  if (otpRecord.expiresAt.getTime() <= Date.now()) {
    await OTP.updateOne(
      { _id: otpRecord._id },
      {
        $set: {
          verified: true,
          verifiedAt: new Date(),
        },
      }
    );

    const error = new Error(
      "This OTP has expired. Please request a new OTP."
    );

    error.code = "OTP_EXPIRED";

    throw error;
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    const error = new Error(
      "Maximum OTP verification attempts exceeded. Please request a new OTP."
    );

    error.code = "OTP_MAX_ATTEMPTS";

    throw error;
  }

  const isValid = await verifyOTPHash(
    normalizedOTP,
    otpRecord.hashedOtp
  );

  if (!isValid) {
    otpRecord.attempts += 1;

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      otpRecord.verified = true;
      otpRecord.verifiedAt = new Date();
    }

    await otpRecord.save();

    const remainingAttempts = Math.max(
      otpRecord.maxAttempts - otpRecord.attempts,
      0
    );

    const error = new Error(
      remainingAttempts > 0
        ? `Invalid OTP. ${remainingAttempts} attempt${
            remainingAttempts === 1 ? "" : "s"
          } remaining.`
        : "Invalid OTP. Maximum attempts exceeded. Please request a new OTP."
    );

    error.code =
      remainingAttempts > 0
        ? "OTP_INVALID"
        : "OTP_MAX_ATTEMPTS";

    error.remainingAttempts = remainingAttempts;

    throw error;
  }

  otpRecord.verified = true;
  otpRecord.verifiedAt = new Date();

  await otpRecord.save();

  return {
    success: true,
    otpId: otpRecord._id,
    verifiedAt: otpRecord.verifiedAt,
  };
};

const getOTPConfiguration = () => {
  return {
    length: OTP_LENGTH,
    expiryMinutes: OTP_EXPIRY_MINUTES,
    maxAttempts: MAX_OTP_ATTEMPTS,
    resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
    supportedPurposes: [...SUPPORTED_PURPOSES],
  };
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  createOTP,
  verifyOTP,
  invalidatePreviousOTPs,
  checkResendCooldown,
  getOTPConfiguration,
};