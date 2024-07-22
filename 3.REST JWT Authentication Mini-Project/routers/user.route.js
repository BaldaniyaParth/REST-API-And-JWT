const route = require("express").Router();
const { uploader } = require("../helper/multer");
const { verifyToken } = require("../middlewares/auth");

const {
  userSignUpValidator,
  mailVerificationValidator,
  sendOtpValidator,
  userSignInValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  removeAccountValidator
} = require("../helper/validator");

const {
  userSignUp,
  mailVerification,
  sendOTP,
  userSignIn,
  forgotPassword,
  resetPassword,
  updateProfile,
  getProfile,
  userLogout,
  removeAccount
} = require("../controllers/user.controller");

// Define routes for user operations
route.post("/signup", userSignUpValidator, userSignUp);
route.post("/mail-verified", mailVerificationValidator, mailVerification);
route.post("/send-otp", sendOtpValidator, sendOTP);
route.post("/signin", userSignInValidator, userSignIn);
route.post("/forgot-password", forgotPasswordValidator, forgotPassword);
route.post("/reset-password", resetPasswordValidator, resetPassword);
route.post(
  "/update-profile",
  uploader.single("profile_pic"),
  verifyToken,
  updateProfileValidator,
  updateProfile
);
route.get("/profile", verifyToken, getProfile);
route.post("/logout", verifyToken, userLogout);
route.post("/remove-account", verifyToken, removeAccountValidator, removeAccount);

module.exports = route;
