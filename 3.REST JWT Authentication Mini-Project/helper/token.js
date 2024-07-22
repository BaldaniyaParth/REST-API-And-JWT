const jwt = require("jsonwebtoken");
require("dotenv").config();

// Function to generate an access token for a user
exports.generateAccessToken = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  return token;
};

// Function for generating access token for forgot password
exports.forgotPasswordAccessToken = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  return token;
};
