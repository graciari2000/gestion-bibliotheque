const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: `Library App <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Admin Verification Code',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Library Admin Registration</h2>
        <p>Your verification code is:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; color: #3498db;">${code}</h1>
        </div>
        <p>This code will expire in ${process.env.ADMIN_CODE_EXPIRY_MINUTES} minutes.</p>
        <p style="font-size: 12px; color: #7f8c8d;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };