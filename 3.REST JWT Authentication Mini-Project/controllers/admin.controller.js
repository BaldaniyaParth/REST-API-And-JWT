const Admin = require("../models/admin.model");
const User = require("../models/user.model");
const mailer = require("../helper/nodemailer");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../helper/token");
require("dotenv").config();

// Controller function for admin sign-in
exports.adminSignIn = async (req, res) => {
  try {
    // Validate request parameters using validationResult function
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are validation errors, return a 422 status code with error details
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const adminData = await Admin.findOne({ email });

    // Compare password with hashed password
    const passwordMatching = await bcrypt.compare(password, adminData.password);

    // If admin email and password match, create a new admin and return success message
    if (adminData.email == email && passwordMatching) {
      // Generate access token
      const accessToken = await generateAccessToken({ user: adminData._id });

      // Update user's access token in the database
      await Admin.findOneAndUpdate(
        { email: adminData.email },
        {
          $set: {
            token: accessToken,
          },
        }
      );

      return res.status(201).json({
        status: 201,
        message: "Admin Login Successfully...",
        data: adminData,
        accessToken: accessToken,
        tokenType: "Bearer",
      });
    }

    return res.status(403).json({
      status: 403,
      message: "Forbidden",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.resetEmail = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email, newEmail } = req.body;

    const adminData = await Admin.findOne({ email });

    if (!adminData) {
      return res.status(400).json({
        status: 400,
        message: "Admin not Found...",
      });
    }

    await Admin.findOneAndUpdate(
      { email: adminData.email },
      {
        $set: {
          email: newEmail,
        },
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Email Update Successfully...",
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email, password, c_password } = req.body;

    const adminData = await Admin.findOne({ email });

    if (!adminData) {
      return res.status(400).json({
        status: 400,
        message: "Admin not Found...",
      });
    }

    if (password != c_password) {
      return res.status(400).json({
        status: 400,
        message: "Password and Confim Password is not same...",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    await Admin.findOneAndUpdate(
      { email: adminData.email },
      {
        $set: {
          password: hashPassword,
        },
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Reset Password Successfully...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

// Controller function to retrieve all user data from the database.
exports.viewByUsers = async (req, res) => {
  try {
    // retrieve all user data from the database.
    const userData = await User.find({});

    return res.status(200).json({
      status: 200,
      message: "All User Data",
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.sendUserMail = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email, subject, message } = req.body;

    const userData = await User.findOne({ email });

    // Return error if user does not exist
    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "Email doesn't exist...",
      });
    }

    // Send OTP verification email
    mailer.sendMailOTP(email, subject, message);

    return res.status(200).json({
      status: 200,
      message: "Mail has been send Successfully...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};

exports.removeUser = async (req, res) => {
    try {
        const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email } =  req.body;

    const userData = await User.findOne({ email });

    // Return error if user does not exist
    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "User doesn't exist...",
      });
    }

    await User.findOneAndDelete({ email: userData.email });

    return res.status(200).json({
        status: 200,
        message: "User Remove Successfully...",
      });

    } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
}