const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware function for verifying JWT token
exports.verifyToken = async (req, res, next) => {
  const token = req.query.token || req.body.token || req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Authentication required. Please provide a valid token...",
    });
  }

  try {
    // Extracting bearer token from the provided token
    const bearerToken = token.split(" ")[1];

    const decodeData = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET);

    // Assigning the decoded user data to the request object
    req.user = decodeData;
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: "Invalid token. Please provide a valid authentication token...",
    });
  }

  // Move to the next middleware
  return next();
};
