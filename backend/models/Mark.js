const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
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
    internalMarks: {
      type: Number,
      required: [true, "Internal marks are required"],
      min: 0,
      max: 40,
    },
    externalMarks: {
      type: Number,
      required: [true, "External marks are required"],
      min: 0,
      max: 60,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pass", "Fail"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

markSchema.statics.calculateGrade = function (totalMarks) {
  const marks = Number(totalMarks);
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  if (marks >= 40) return "E";
  return "F";
};

markSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

markSchema.set("toJSON", {
  virtuals: true,
});

markSchema.set("toObject", {
  virtuals: true,
});

const Mark = mongoose.model("Mark", markSchema);

module.exports = Mark;