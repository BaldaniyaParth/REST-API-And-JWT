const route = require("express").Router(); 
const { verifyToken } = require("../middlewares/auth");
const { adminSignIn, resetEmail, resetPassword, viewByUsers, sendUserMail, removeUser } = require("../controllers/admin.controller");
const { adminSignInValidator, adminResetEmailValidator, adminResetPasswordValidator, adminSendEmailValidator, adminRemoveUserValidator  } = require("../helper/validator"); 


route.post("/signin", adminSignInValidator, adminSignIn);
route.post("/reset-email", verifyToken, adminResetEmailValidator, resetEmail);
route.post("/reset-password", verifyToken, adminResetPasswordValidator, resetPassword);
route.get("/view-users", verifyToken, viewByUsers)
route.post("/send-mail", verifyToken, adminSendEmailValidator, sendUserMail)
route.post("/remove-user", verifyToken, adminRemoveUserValidator, removeUser)

module.exports = route; 
