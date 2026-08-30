const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { createOTP } = require("./otpService");
const { sendOTPEmail } = require("./emailService");

const PASSWORD_SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = "7d";

const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required.");
  }

  return email.trim().toLowerCase();
};

const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    throw new Error("Phone number is required.");
  }

  return phone.trim();
};

const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required.");
  }

  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }
};

const createAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

const registerUser = async ({
  name,
  email,
  phone,
  password,
}) => {
  if (!name || typeof name !== "string") {
    throw new Error("Name is required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  validatePassword(password);

  const existingEmail = await User.findOne({
    email: normalizedEmail,
  });

  if (existingEmail) {
    const error = new Error(
      "An account with this email already exists."
    );

    error.code = "EMAIL_ALREADY_EXISTS";

    throw error;
  }

  const existingPhone = await User.findOne({
    phone: normalizedPhone,
  });

  if (existingPhone) {
    const error = new Error(
      "An account with this phone number already exists."
    );

    error.code = "PHONE_ALREADY_EXISTS";

    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    PASSWORD_SALT_ROUNDS
  );

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password: hashedPassword,
    role: "STUDENT",
    accountStatus: "PENDING_VERIFICATION",
    emailVerified: false,
    phoneVerified: false,
  });

  try {
    const otpResult = await createOTP({
      userId: user._id,
      destination: user.email,
      purpose: "EMAIL_VERIFICATION",
    });

    await sendOTPEmail({
      to: user.email,
      otp: otpResult.otp,
      expiresInMinutes: 5,
    });

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      verification: {
        purpose: "EMAIL_VERIFICATION",
        expiresAt: otpResult.expiresAt,
        expiresInSeconds: otpResult.expiresInSeconds,
      },
    };
  } catch (error) {
    await User.deleteOne({
      _id: user._id,
    });

    throw error;
  }
};

const verifyEmailOTP = async ({
  userId,
  otp,
}) => {
  const { verifyOTP } = require("./otpService");

  const result = await verifyOTP({
    userId,
    otp,
    purpose: "EMAIL_VERIFICATION",
  });

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User account not found.");
  }

  user.emailVerified = true;
  user.emailVerifiedAt = result.verifiedAt;

  if (user.emailVerified) {
    user.accountStatus = "ACTIVE";
  }

  await user.save();

  return {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    },
    token:
      user.emailVerified
        ? createAuthToken(user)
        : null,
  };
};

const loginUser = async ({
  email,
  password,
}) => {
  const normalizedEmail = normalizeEmail(email);

  validatePassword(password);

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error(
      "Invalid email or password."
    );

    error.code = "INVALID_CREDENTIALS";

    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    const error = new Error(
      "Invalid email or password."
    );

    error.code = "INVALID_CREDENTIALS";

    throw error;
  }

  if (user.accountStatus !== "ACTIVE") {
    const error = new Error(
      "Your account is not active yet. Please complete verification."
    );

    error.code = "ACCOUNT_NOT_ACTIVE";

    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    success: true,
    token: createAuthToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      lastLoginAt: user.lastLoginAt,
    },
  };
};

module.exports = {
  registerUser,
  verifyEmailOTP,
  loginUser,
  createAuthToken,
};


