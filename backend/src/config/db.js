const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in the environment."
      );
    }

    const connection = await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("");
    console.log("========================================");
    console.log("       OJDV MONGODB CONNECTION");
    console.log("========================================");
    console.log(`MongoDB Host: ${connection.connection.host}`);
    console.log(`Database: ${connection.connection.name}`);
    console.log("Status: Connected");
    console.log("========================================");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("       MONGODB CONNECTION FAILED");
    console.error("========================================");
    console.error(error.message);
    console.error("========================================");
    console.error("");

    throw error;
  }
};

module.exports = connectDB;