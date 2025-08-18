const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["retailer", "admin"],
      default: "retailer",
    },
    mobileNumber: {
      type: String,
      required: function () {
        return this.role === "retailer";
      },
    },
    address: {
      type: String,
      required: function () {
        return this.role === "retailer";
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
