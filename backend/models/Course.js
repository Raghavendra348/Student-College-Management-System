const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false,
    },
    duration: {
      type: String,
      trim: true,
      default: "4 Years",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

courseSchema.set("toJSON", {
  virtuals: true,
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;