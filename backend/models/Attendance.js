const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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
    totalClasses: {
      type: Number,
      required: [true, "Total classes are required"],
      min: 0,
    },
    attendedClasses: {
      type: Number,
      required: [true, "Attended classes are required"],
      min: 0,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

attendanceSchema.set("toJSON", {
  virtuals: true,
});

attendanceSchema.set("toObject", {
  virtuals: true,
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;