const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  mobile: {
    type: String,
    require: true,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("User", userSchema);
