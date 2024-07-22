const route = require("express").Router();
const userController = require("../controllers/userController");

const { mailVerification, resetPassword, updatePassword, resetSuccess } =
  userController;
  
route.get("/mail-verification", mailVerification);
route.get("/reset-password", resetPassword);
route.post("/reset-password", updatePassword);
route.get("/reset-success", resetSuccess);

module.exports = route;
