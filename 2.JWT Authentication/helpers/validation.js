const { check } = require("express-validator");

exports.registerValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please enter valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("mobile", "Please enter valid mobile number").isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "Password must be greter than 6 characters, at least one uppercase, at least one lowercase, at least one symbol, and at least one number"
  ).isStrongPassword({
    minLength: 6,
    minSymbols: 1,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  }),
  check("image")
    .custom((value, { req }) => {
      if (
        req.file.mimetype === "image/jpeg" ||
        req.file.mimetype === "image/png"
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please upload jpeg or png file"),
];

exports.sendMailVerificationValidator = [
  check("email", "Please enter valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

exports.forgotPasswordValidator = [
  check("email", "Please enter valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

exports.loginValidator = [
  check("email", "Please enter valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "Password is required").not().isEmpty(),
];

exports.updateProfileValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("mobile", "Please enter valid mobile number").isLength({
    min: 10,
    max: 10,
  }),
];

exports.otpMailValidator = [
  check("email", "Please enter valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

exports.verifyOtpValidator = [
  check("user_id", "User id is required").not().isEmpty(),
  check("otp", "OTP is required").not().isEmpty(),
];
