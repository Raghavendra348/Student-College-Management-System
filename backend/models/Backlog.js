const mongoose = require("mongoose");

const backlogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Cleared"],
      default: "Pending",
    },
    clearedMarks: {
      type: Number,
      default: null,
    },
    clearedSemester: {
      type: Number,
      default: null,
    },
    clearedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

backlogSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

backlogSchema.set("toJSON", {
  virtuals: true,
});

backlogSchema.set("toObject", {
  virtuals: true,
});

const Backlog = mongoose.model("Backlog", backlogSchema);

module.exports = Backlog;