const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blackListModel");
require("dotenv").config();

exports.verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Authentication required. Please provide a valid token...",
    });
  }

  try {
    const bearerToken = token.split(" ")[1];

    const blackListToken = await Blacklist.findOne({ token: bearerToken });

    if (blackListToken) {
      return res.status(401).json({
        status: 401,
        message: "Expired token, Please re-login...",
      });
    }

    try {
      const decodeData = jwt.verify(
        bearerToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      req.user = decodeData;
    } catch (err) {
      try {
        const dataDecode = jwt.verify(
          bearerToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        req.user = dataDecode;
      } catch (err) {
        return res.status(401).json({
          status: 401,
          message: "Authentication required. Please provide a valid token...",
        });
      }
    }
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: "Invalid token. Please provide a valid authentication token...",
    });
  }

  return next();
};
