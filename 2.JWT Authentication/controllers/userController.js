const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");
const Blacklist = require("../models/blackListModel");
const Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mailer = require("../helpers/nodemailer");
const {
  oneMinuteExpiry,
  threeMinuteExpiry,
} = require("../helpers/otpValidator");
const path = require("path");
const fs = require("fs").promises;
const randomString = require("randomstring");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.userRegister = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { name, email, mobile, password } = req.body;

    const isExists = await User.findOne({ email });

    if (isExists) {
      if (req.file) {
        const imagePath = path.join(
          __dirname,
          "../public/images",
          req.file.filename
        );
        fs.unlink(imagePath);
      }

      return res.status(409).json({
        status: 409,
        message: "Email Already Existing...",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      mobile,
      password: hashPassword,
      image: "image/" + req.file.filename,
    });

    const userData = await user.save();

    const msg =
      "<p> Hii " +
      name +
      ', Please <a href="' +
      process.env.MAIL_LINK +
      "" +
      userData._id +
      '"> Verify </a> your mail. </p>';

    mailer.sendMail(email, "Mail Verification", msg);

    return res.status(201).json({
      status: 201,
      message: "Data Insert Succesfully...",
      user: userData,
    });
  } catch (err) {
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../public/images",
        req.file.filename
      );
      fs.unlink(imagePath);
    }

    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.mailVerification = async (req, res) => {
  try {
    if (req.query.id == undefined) {
      res.render("404.ejs");
    }

    const userData = await User.findOne({ _id: req.query.id });

    if (userData) {
      if (userData.is_verified == 1) {
        res.render("mail-verification.ejs", {
          message: "Your mail already verified",
        });
      }
      await User.findOneAndUpdate(
        { _id: req.query.id },
        {
          $set: {
            is_verified: 1,
          },
        }
      );
      res.render("mail-verification.ejs", {
        message: "Mail has been verified Successfully",
      });
    } else {
      res.render("mail-verification.ejs", { message: "User Not Found" });
    }
  } catch (err) {
    return res.render("404.ejs");
  }
};

exports.sendMailVerification = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "Email doesn't exists... ",
      });
    }

    if (userData.is_verified == 1) {
      return res.status(400).json({
        status: 400,
        message: userData.email + "Mail is already verified...",
      });
    }

    const msg =
      "<p> Hii " +
      userData.name +
      ', Please <a href="' +
      process.env.MAIL_LINK +
      "" +
      userData._id +
      '"> Verify </a> your mail. </p>';

    mailer.sendMail(userData.email, "Mail Verification", msg);

    return res.status(200).json({
      status: 200,
      message: "Verification link sent your mail, Please check...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "Email doesn't exists... ",
      });
    }

    const random = randomString.generate();

    const msg =
      "<p> Hii " +
      userData.name +
      ', Please <a href="' +
      process.env.RESET_PASSWORD +
      "" +
      random +
      '"> here </a> to Reset your Password. </p>';

    await ResetPassword.deleteMany({ user_id: userData._id });

    const resetPassword = new ResetPassword({
      user_id: userData._id,
      token: random,
    });

    await resetPassword.save();

    mailer.sendMail(userData.email, "Reset Password", msg);

    return res.status(200).json({
      status: 200,
      message: "Reset Password link send to your mail, please check...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (req.query.token == undefined) {
      res.render("404.ejs");
    }

    const resetData = await ResetPassword.findOne({ token: req.query.token });

    if (!resetData) {
      res.render("404.ejs");
    }

    return res.render("reset-password.ejs", { resetData });
  } catch (err) {
    return res.render("404.ejs");
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { user_id, password, c_password } = req.body;

    const resetData = await ResetPassword.findOne({ user_id });

    if (password != c_password) {
      return res.render("reset-password.ejs", {
        resetData,
        error: "Confim Password not matching...",
      });
    }

    const hashPassword = await bcrypt.hash(c_password, 10);

    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          password: hashPassword,
        },
      }
    );

    await ResetPassword.deleteOne({ user_id });

    return res.redirect("/reset-success");
  } catch (err) {
    return res.render("404.ejs");
  }
};

exports.resetSuccess = async (req, res) => {
  try {
    return res.render("reset-success.ejs");
  } catch (err) {
    return res.render("404.ejs");
  }
};

exports.generateAccessToken = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

exports.generateRefreshToken = async (user) => {
  const token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

exports.loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(401).json({
        status: 401,
        message: "Email and Password is Incorrect...",
      });
    }

    const passwordMatching = await bcrypt.compare(password, userData.password);

    if (!passwordMatching) {
      return res.status(401).json({
        status: 401,
        message: "Email and Password is Incorrect...",
      });
    }

    if (userData.is_verified == 0) {
      return res.status(401).json({
        status: 401,
        message: "Please first you verify your mail...",
      });
    }

    const accessToken = await this.generateAccessToken({ user: userData });
    const refreshToken = await this.generateRefreshToken({ user: userData });

    return res.status(200).json({
      status: 200,
      message: "Login Succesfully...",
      user: userData,
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: "Bearer",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const userData = req.user.user;
    return res.status(200).json({
      status: 200,
      message: "Successfully access your profile...",
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { name, mobile } = req.body;

    const data = {
      name,
      mobile,
    };

    const userId = req.user.user._id;

    if (req.file !== undefined) {
      data.image = "images/" + req.file.filename;

      const oldUser = await User.findOne({ _id: userId });

      const oldImagePath = path.join(__dirname, "../public", oldUser.image);
      fs.unlink(oldImagePath);
    }

    const userData = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: data,
      },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      message: "Successfully update your profile...",
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const userId = req.user.user._id;

    const userData = await User.findOne({ _id: userId });

    const accessToken = await this.generateAccessToken({ user: userData });
    const refreshToken = await this.generateRefreshToken({ user: userData });

    return res.status(200).json({
      status: 200,
      message: "Refresh Token",
      user: userData,
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: "Bearer",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["authorization"];

    const bearerToken = token.split(" ")[1];

    const blacklist = new Blacklist({
      token: bearerToken,
    });

    await blacklist.save();

    // Clear all cookie and storage backend side throw
    res.setHeader("Clear-Site-Data", '"cookies","storage"');

    return res.status(200).json({
      status: 200,
      message: "Logout Successfully...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "Email doesn't exists... ",
      });
    }

    if (userData.is_verified == 1) {
      return res.status(400).json({
        status: 400,
        message: userData.email + "Mail is already verified...",
      });
    }

    const generateRandomDigit = Math.floor(1000 + Math.random() * 9000);

    const oldOtpData = await Otp.findOne({ user_id: userData._id });

    if (oldOtpData) {
      const sendNextOtp = await oneMinuteExpiry(oldOtpData.timestamp);

      if (!sendNextOtp) {
        return res.status(429).json({
          status: 429,
          message: "Too many requests. Please wait some time.",
        });
      }
    }

    const cDate = new Date();

    await Otp.findOneAndUpdate(
      { user_id: userData._id },
      { otp: generateRandomDigit, timestamp: new Date(cDate.getTime()) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const msg =
      "<p> Hii  <b>" +
      userData.name +
      "</b>, <br> your otp is <h4> " +
      generateRandomDigit +
      "</h4> </p>";

    mailer.sendMail(userData.email, "Otp Verification", msg);

    return res.status(200).json({
      status: 200,
      message: "Otp has been send to your mail, Please check...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { user_id, otp } = req.body;

    const otpData = await Otp.findOne({
      user_id,
      otp,
    });

    if (!otpData) {
      return res.status(401).json({
        status: 401,
        message: "You enter wrong otp...",
      });
    }

    const expiryOtp = await threeMinuteExpiry(otpData.timestamp);

    if (expiryOtp) {
      return res.status(401).json({
        status: 401,
        message: "Your OTP has been Expired...",
      });
    }

    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          is_verified: 1,
        },
      }
    );

    await Otp.deleteOne({ user_id });

    return res.status(200).json({
      status: 200,
      message: "Account Verified Successfully...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};
