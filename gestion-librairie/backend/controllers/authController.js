const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Temporary storage for admin verification codes
const adminCodes = new Map();

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
    try {
        await transporter.sendMail({
            from: `Library System <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Admin Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Library Admin Registration</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #f4f4f4; padding: 10px; margin: 10px 0; font-size: 24px; letter-spacing: 2px; text-align: center;">
                        <strong>${code}</strong>
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                    <p style="color: #7f8c8d;">If you didn't request this code, please ignore this email.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role = 'member', adminCode } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Validate role
        if (!['member', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Additional validation for admin registration
        if (role === 'admin') {
            if (!adminCode) {
                return res.status(400).json({ message: 'Admin code is required for admin registration' });
            }

            const storedCode = adminCodes.get(email);
            if (!storedCode || storedCode.code !== adminCode) {
                return res.status(400).json({ message: 'Invalid admin verification code' });
            }
            if (storedCode.expires < Date.now()) {
                adminCodes.delete(email);
                return res.status(400).json({ message: 'Verification code has expired' });
            }
            adminCodes.delete(email); // Single-use code
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        // Return response without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Request admin verification code
exports.requestAdminCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Domain restriction for admin registration
        const adminDomain = process.env.ADMIN_EMAIL_DOMAIN || '@yourlibrary.com';
        if (!email.endsWith(adminDomain)) {
            return res.status(403).json({
                message: `Admin registration requires an email ending with ${adminDomain}`
            });
        }

        // Generate 6-digit code
        const code = crypto.randomInt(100000, 999999).toString();
        const expires = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

        // Store code temporarily
        adminCodes.set(email, { code, expires });

        // Send verification email
        await sendVerificationEmail(email, code);

        res.json({
            success: true,
            message: 'Verification code sent to email'
        });

    } catch (error) {
        console.error('Admin code request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification code',
            error: error.message
        });
    }
};

// User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Return response without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Verify admin code (separate from registration)
exports.verifyAdminCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Email and code are required' });
        }

        const storedCode = adminCodes.get(email);
        if (!storedCode || storedCode.code !== code) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        if (storedCode.expires < Date.now()) {
            adminCodes.delete(email);
            return res.status(400).json({ success: false, message: 'Verification code has expired' });
        }

        res.json({
            success: true,
            message: 'Verification successful'
        });

    } catch (error) {
        console.error('Code verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed',
            error: error.message
        });
    }
};