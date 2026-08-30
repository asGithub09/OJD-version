require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");

const ADMIN_EMAIL =
  "akash.srivastava0905@gmail.com";

const ADMIN_PASSWORD =
  "Akash@12345";

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected.");

    const passwordHash =
      await bcrypt.hash(
        ADMIN_PASSWORD,
        12
      );

    let user = await User.findOne({
      email: ADMIN_EMAIL,
    }).select("+password");

    if (user) {
      user.name =
        "Akash Srivastava";

      user.password =
        passwordHash;

      user.role =
        "ADMIN";

      user.accountStatus =
        "ACTIVE";

      user.emailVerified =
        true;

      user.emailVerifiedAt =
        user.emailVerifiedAt ||
        new Date();

      await user.save();

      console.log("");
      console.log(
        "ADMIN ACCOUNT UPDATED SUCCESSFULLY."
      );
    } else {
      user = await User.create({
        name:
          "Akash Srivastava",

        email:
          ADMIN_EMAIL,

        phone:
          "+919999999999",

        password:
          passwordHash,

        role:
          "ADMIN",

        accountStatus:
          "ACTIVE",

        emailVerified:
          true,

        emailVerifiedAt:
          new Date(),

        phoneVerified:
          false,
      });

      console.log("");
      console.log(
        "ADMIN ACCOUNT CREATED SUCCESSFULLY."
      );
    }

    console.log("");
    console.log(
      "Email:",
      user.email
    );

    console.log(
      "Role:",
      user.role
    );

    console.log(
      "Status:",
      user.accountStatus
    );

    console.log(
      "Email verified:",
      user.emailVerified
    );

    console.log("");

    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected."
    );
  } catch (error) {
    console.error("");
    console.error(
      "ADMIN SETUP FAILED:"
    );
    console.error(
      error.message
    );

    process.exit(1);
  }
};

run();