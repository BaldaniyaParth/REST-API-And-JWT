const { check } = require("express-validator");


// User Validation


// Validator middleware for user sign-up
exports.userSignUpValidator = [
  check("name", "Name is required").not().isEmpty(),

  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),

  check("phone_number", "Please enter valid phone number").isLength({
    min: 10,
    max: 10,
  }),

  check("exam_name", "Exam name is required").not().isEmpty(),

  check(
    "password",
    "Please enter minimum 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// Validator middleware for email verification
exports.mailVerificationValidator = [
  check("otp_no", "OTP is required")
    .not()
    .isEmpty()
    .isLength({ min: 4, max: 4 }),
];

// Validator middleware for sending OTP
exports.sendOtpValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
];

// Validator middleware for user sign-in
exports.userSignInValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),

  check(
    "password",
    "Please enter minimum 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// Validator middleware for forgot password
exports.forgotPasswordValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
];

// Validator middleware for reset password
exports.resetPasswordValidator = [
  check(
    "password",
    "Please enter minimum 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// Validator middleware for user sign-up
exports.updateProfileValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),

  check("phone_number", "Please enter valid phone number").isLength({
    min: 10,
    max: 10,
  }),

  check(
    "password",
    "Please enter minimum 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// Validator middleware for user delete the account
exports.removeAccountValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
]


// Admin Validation


// Validator middleware for admin sign-in
exports.adminSignInValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),

  check(
    "password",
    "Please enter minimum 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// Validator middleware for admin reset email
exports.adminResetEmailValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
]

// Validator middleware for admin reset password
exports.adminResetPasswordValidator = [
  check(
    "password",
    "Please enter minimum 6 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// Validator middleware for admin send email to user
exports.adminSendEmailValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
]

// Validator middleware for admin remove user
exports.adminRemoveUserValidator = [
  check("email", "Please enter valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
]