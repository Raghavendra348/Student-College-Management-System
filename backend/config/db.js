const mongoose = require("mongoose");

let memoryServerInstance = null;

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_college_ms";

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 1500,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (connErr) {
      console.log(
        `Direct MongoDB connection at ${mongoUri} not available (${connErr.message}).`
      );

      if (!memoryServerInstance) {
        console.log("Starting embedded MongoDB instance for seamless local operation...");
        const { MongoMemoryServer } = require("mongodb-memory-server");
        memoryServerInstance = await MongoMemoryServer.create();
        global.__MMS_SERVER__ = memoryServerInstance;
      }

      const memUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`Embedded MongoDB Server Connected at: ${memUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
