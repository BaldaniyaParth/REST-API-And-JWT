const mongoose = require("mongoose");

const resetPasswordSchema = new mongoose.Schema({
  user_id: {
    type: String,
    require: true,
    ref: "User",
  },
  token: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("ResetPassword", resetPasswordSchema);
