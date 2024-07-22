const route = require("express").Router();
const path = require("path");
const multer = require("multer");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const {
  registerValidator,
  sendMailVerificationValidator,
  forgotPasswordValidator,
  loginValidator,
  updateProfileValidator,
  otpMailValidator,
  verifyOtpValidator,
} = require("../helpers/validation");

const {
  userRegister,
  sendMailVerification,
  forgotPassword,
  loginUser,
  userProfile,
  updateProfile,
  refreshToken,
  logoutUser,
  sendOtp,
  verifyOtp,
} = userController;

const { verifyToken } = auth;

const storageFile = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, path.join(__dirname, "../public/images"));
    }
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storageFile,
  fileFilter: fileFilter,
});

route.post(
  "/register",
  upload.single("image"),
  registerValidator,
  userRegister
);

route.post(
  "/send-mail-verification",
  sendMailVerificationValidator,
  sendMailVerification
);

route.post("/forgot-password", forgotPasswordValidator, forgotPassword);

route.post("/login", loginValidator, loginUser);

// Authentication Route
route.get("/profile", verifyToken, userProfile);

route.post(
  "/update-profile",
  verifyToken,
  upload.single("image"),
  updateProfileValidator,
  updateProfile
);

route.get("/refresh-token", verifyToken, refreshToken);

route.get("/logout", verifyToken, logoutUser);

// otp verification route
route.post("/send-otp", otpMailValidator, sendOtp);
route.post("/verify-otp", verifyOtpValidator, verifyOtp);

module.exports = route;
