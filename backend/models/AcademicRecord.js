const mongoose = require("mongoose");

const academicRecordSchema = new mongoose.Schema(
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
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 1,
      max: 4,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Current", "Completed"],
      default: "Current",
    },
  },
  {
    timestamps: true,
  }
);

academicRecordSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

academicRecordSchema.set("toJSON", {
  virtuals: true,
});

academicRecordSchema.set("toObject", {
  virtuals: true,
});

const AcademicRecord = mongoose.model("AcademicRecord", academicRecordSchema);

module.exports = AcademicRecord;