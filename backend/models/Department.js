const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
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

departmentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

departmentSchema.set("toJSON", {
  virtuals: true,
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;