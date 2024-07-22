const mailer = require("../helper/nodemailer");

// Function for sending OTP verification email
exports.sendMailOTP = async (email, name, generateRandomDigit) => {
  const message =
    "<p> Hiii " +
    name +
    " <br> Your Verify OTP :</p> " +
    generateRandomDigit +
    "";

  // Send email with OTP using nodemailer helper
  mailer.sendMailOTP(email, "OTP Verification", message);
};

// Function for sending forgot password link
exports.sendForgotPasswordLink = async (email, name, resetPassword, token) => {
  const message =
    "<p> Hii " +
    name +
    ', Please <a href="' +
    resetPassword +
    "" +
    token +
    '"> here </a> to Reset your Password. </p>';

  // Send email with forgot password link using nodemailer helper
  mailer.sendMailOTP(email, "Forgot Password", message);
};


  