const mailer = require("nodemailer"); 
require("dotenv").config(); 

// Create a transporter for sending emails using SMTP
const transporter = mailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT, 
  secure: false, 
  requireTLS: true, 
  auth: {
    user: process.env.SMTP_MAIL, 
    pass: process.env.SMTP_PASSWORD, 
  },
});

// Function to send an email with OTP (One-Time Password)
const sendMailOTP = async (email, subject, content) => {
  try {
    var mailOption = {
      from: process.env.SMTP_MAIL, 
      to: email,
      subject: subject,
      html: content, 
    };

    // Send the email using the transporter
    transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.log(err); 
      }
    });
  } catch (err) {
    console.log(err); 
  }
};

module.exports = { sendMailOTP }; 
