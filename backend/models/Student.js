const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    studentId: {
      type: String,
      required: [true, "Student Roll Number / ID is required"],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Student full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Student email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Student contact phone is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "Computer Science",
    },
    course: {
      type: String,
      trim: true,
      default: "B.Tech",
    },
    admissionYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    status: {
      type: String,
      enum: ["Studying", "Graduated", "Discontinued"],
      default: "Studying",
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

studentSchema.set("toJSON", {
  virtuals: true,
});

studentSchema.set("toObject", {
  virtuals: true,
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;