const mongoose = require("mongoose");

// Define the schema for the user collection
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    trim: true,
  },
  phone_number: {
    type: String,
    require: true,
    trim: true,
  },
  exam_name: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  otp: {
    otp_no: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  email_verify_status: {
    type: String,
    enum: {
      values: ["Pending", "Verified"],
    },
    default: "Pending",
  },
  token: {
    type: String,
    default: "",
  },
  reset_password: {
    type: String,
    default: "",
  },
  profile_pic: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User", userSchema); // Export the User model based on the userSchema
