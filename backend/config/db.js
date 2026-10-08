const mongoose = require("mongoose");

let memoryServerInstance = null;

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_college_ms";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (connErr) {
    console.error(
      `MongoDB connection failed at ${mongoUri} (${connErr.message})`
    );

    // Only attempt in-memory server if explicitly in local development and package is installed
    if (process.env.NODE_ENV !== "production") {
      try {
        if (!memoryServerInstance) {
          console.log("Starting embedded in-memory MongoDB for local development...");
          const { MongoMemoryServer } = require("mongodb-memory-server");
          memoryServerInstance = await MongoMemoryServer.create();
          global.__MMS_SERVER__ = memoryServerInstance;
        }

        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`Embedded MongoDB Connected at: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error("Local in-memory fallback not available:", memErr.message);
      }
    }

    console.error(
      "\n======================================================\n" +
        "ACTION REQUIRED: Please set a valid MONGODB_URI in your environment variables.\n" +
        "Ensure your MongoDB Atlas user password and cluster host URL are correct.\n" +
        "======================================================\n"
    );
    process.exit(1);
  }
};

module.exports = connectDB;
