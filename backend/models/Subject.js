const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    subjectCode: {
      type: String,
      required: [true, "Subject code is required"],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    course: {
      type: String,
      trim: true,
      default: "B.Tech",
    },
    department: {
      type: String,
      trim: true,
      default: "Computer Science",
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    credits: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

subjectSchema.set("toJSON", {
  virtuals: true,
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
