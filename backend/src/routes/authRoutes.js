const express = require("express");

const {
  registerUser,
  verifyEmailOTP,
  loginUser,
} = require("../services/authService");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    const result = await registerUser({
      name,
      email,
      phone,
      password,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const {
      userId,
      otp,
    } = req.body;

    const result = await verifyEmailOTP({
      userId,
      otp,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
