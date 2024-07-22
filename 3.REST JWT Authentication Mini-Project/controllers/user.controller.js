const User = require("../models/user.model");
const { threeMinuteExpiry } = require("../helper/otpexpiry");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { sendMailOTP, sendForgotPasswordLink } = require("../helper/sendmail");
const {
  generateAccessToken,
  forgotPasswordAccessToken,
} = require("../helper/token");
const cloudinary = require("../helper/uploadfile");

// Controller function for user sign-up
exports.userSignUp = async (req, res) => {
  try {
    // Validate request parameters using validationResult function
    const errors = validationResult(req);

    // If there are validation errors, return a 422 status code with error details
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { name, email, phone_number, exam_name, password } = req.body;

    // Check if email already exists
    const isExitsEmail = await User.findOne({ email });
    if (isExitsEmail) {
      return res.status(409).json({
        status: 409,
        message: "Email already exists...",
      });
    }

    // Check if phone number already exists
    const isExitsPhoneNumber = await User.findOne({ phone_number });
    if (isExitsPhoneNumber) {
      return res.status(409).json({
        status: 409,
        message: "Phone number already exists...",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const userData = new User({
      name,
      email,
      phone_number,
      exam_name,
      password: hashPassword,
    });

    await userData.save();

    // Generate a random OTP
    const generateRandomDigit = Math.floor(1000 + Math.random() * 9000);

    // Update user's OTP in the database
    await User.findOneAndUpdate(
      { email: userData.email },
      {
        $set: {
          otp: {
            otp_no: generateRandomDigit,
            timestamp: new Date(),
          },
        },
      }
    );

    // Send OTP verification email
    sendMailOTP(userData.email, userData.name, generateRandomDigit);

    return res.status(201).json({
      status: 201,
      message: "Insert User Data Successfully...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Wrong...",
    });
  }
};

// Controller function for verifying email after sign-up
exports.mailVerification = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation Errors...",
        errors: errors.array(),
      });
    }

    const { email, otp_no } = req.body;

    const userData = await User.findOne({ email });

    // Check if user exists or OTP is incorrect
    if (!userData || userData.otp.otp_no != otp_no) {
      return res.status(401).json({
        status: 401,
        message: "You entered wrong OTP...",
      });
    }

    // Check if OTP has expired
    const expiryOtp = await threeMinuteExpiry(userData.otp.timestamp);
    if (expiryOtp) {
      await User.findOneAndUpdate(
        { email: userData.email },
        {
          $set: {
            otp: {
              otp_no: "",
              timestamp: new Date(),
            },
          },
        }
      );

      return res.status(401).json({
        status: 401,
        message: "Your OTP has expired...",
      });
    }

    // Check if email verification is pending
    if (userData.email_verify_status == "Pending") {
      await User.findOneAndUpdate(
        { email: userData.email },
        {
          $set: {
            email_verify_status: "Verified",
            "otp.otp_no": "",
            "otp.timestamp": new Date(),
          },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Mail Verification Successfully...",
      });
    } else {
      // Return error if email is already verified
      return res.status(409).json({
        status: 409,
        message: "Email already verified...",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Wrong...",
    });
  }
};

// Controller function for sending OTP
exports.sendOTP = async (req, res) => {
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

    // Return error if user does not exist
    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "Email doesn't exist...",
      });
    }

    // Return error if email is already verified
    if (userData.email_verify_status == "Verified") {
      return res.status(409).json({
        status: 409,
        message: "Email already verified...",
      });
    }

    // Generate a random OTP
    const generateRandomDigit = Math.floor(1000 + Math.random() * 9000);

    // Update user's OTP in the database
    await User.findOneAndUpdate(
      { email: userData.email },
      {
        $set: {
          otp: {
            otp_no: generateRandomDigit,
            timestamp: new Date(),
          },
        },
      }
    );

    // Send OTP verification email
    sendMailOTP(userData.email, userData.name, generateRandomDigit);

    return res.status(200).json({
      status: 200,
      message: "OTP has been sent to your mail, Please check...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Wrong...",
    });
  }
};

// Controller function for user sign-in
exports.userSignIn = async (req, res) => {
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

    // Return error if user does not exist
    if (!userData) {
      return res.status(401).json({
        status: 401,
        message: "Email and Password are incorrect...",
      });
    }

    // Compare password with hashed password
    const passwordMatching = await bcrypt.compare(password, userData.password);

    // Return error if password is incorrect
    if (!passwordMatching) {
      return res.status(401).json({
        status: 401,
        message: "Email and Password are incorrect...",
      });
    }

    // Return error if email is not verified
    if (userData.email_verify_status == "Pending") {
      return res.status(401).json({
        status: 401,
        message: "Please verify your email first...",
      });
    }

    // Generate access token
    const accessToken = await generateAccessToken({ user: userData._id });

    // Update user's access token in the database
    await User.findOneAndUpdate(
      { email: userData.email },
      {
        $set: {
          token: accessToken,
        },
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Login Successful...",
      user: userData,
      accessToken: accessToken,
      tokenType: "Bearer",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Wrong...",
    });
  }
};

// Controller function for handling forgot password request
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

    // Return error if user does not exist
    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "Email doesn't exist...",
      });
    }

    // Generate access token for forgot password
    const accessToken = await forgotPasswordAccessToken({ user: userData._id });

    // Update user's reset password token in the database
    await User.findOneAndUpdate(
      { email: userData.email },
      {
        $set: {
          reset_password: accessToken,
        },
      }
    );

    // Construct reset password link
    const resetPassword = process.env.RESET_PASSWORD;

    // Send forgot password link to user's email
    sendForgotPasswordLink(
      userData.email,
      userData.name,
      resetPassword,
      accessToken
    );

    return res.status(200).json({
      status: 200,
      message: "Reset Password link sent to your email, please check...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Wrong...",
    });
  }
};

// Controller function for resetting the password
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

    // If the reset token is not provided in the query parameters, return a 400 status code
    if (req.query.token == undefined) {
      return res.status(400).json({
        status: 400,
        message: "Page not found",
      });
    }

    // Find the user associated with the provided reset token
    const userData = await User.findOne({ reset_password: req.query.token });

    // If user data is not found, return a 400 status code indicating that the user doesn't exist
    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "User doesn't exist...",
      });
    }

    // Destructure password and confirm password from request body
    const { password, c_password } = req.body;

    // If password and confirm password do not match, return a 400 status code
    if (password != c_password) {
      return res.status(400).json({
        status: 400,
        message: "Password and Confim Password is not same...",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    await User.findOneAndUpdate(
      { email: userData.email },
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
      message: "Something Wrong...",
    });
  }
};

// This function is responsible for updating a user's profile.
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

    const { name, email, phone_number, password } = req.body;

    // Extract the user ID from the authenticated user object in the request
    const userId = req.user.user;

    const userData = await User.findOne({userId});

     // If user data is not found, return an error response
     if(!userData){
       return res.status(401).json({
         status: 401,
         message: "Authentication required. Please provide a valid token...",
       });
     }

    // Retrieve the profile picture from the request
    const profile_pic = req.file;

    // Upload the profile picture to Cloudinary
    const result = await cloudinary.uploader.upload(profile_pic.path);
    const profilePicUrl = result.secure_url;

    // Hash the password using bcrypt with a salt factor of 10
    const hashPassword = await bcrypt.hash(password, 10);

    

    // Update the user's document in the database with the new profile information
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          name,
          email,
          phone_number,
          password: hashPassword,
          profile_pic: profilePicUrl,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      message: "Update Profile Successfully...",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Something Wrong...",
    });
  }
};

// Controller function to retrieve user profile
exports.getProfile = async (req, res) => {
  try {
    // Extract user ID from request object
    const userId = req.user.user;

    // Find user data based on user ID
    const userData = await User.findOne({ _id: userId });

    // If user data is not found, return an error response
    if (!userData) {
      return res.status(400).json({
        status: 400,
        message: "User Not Found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Successfully Retrieved User Data",
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Went Wrong...",
    });
  }
};

//Controller function to handle user logout.
exports.userLogout = async (req,res) => {
  try {

     // Extract the user ID from the authenticated user object in the request
     const userId = req.user.user;

     const userData = await User.findOne({userId});

     // If user data is not found, return an error response
     if(!userData){
       return res.status(401).json({
         status: 401,
         message: "Authentication required. Please provide a valid token...",
       });
     }

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          token : ''
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      message: "Logout Successfully...",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Went Wrong...",
    });
  }
} 

exports.removeAccount = async (req, res) => {
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
      message: "Email doesn't exist...",
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