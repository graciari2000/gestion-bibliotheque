const { check } = require('express-validator');

exports.registerSchema = [
    check('name')
        .notEmpty()
        .withMessage('Name is required')
        .trim()
        .escape(),

    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

exports.loginSchema = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
];

exports.adminCodeRequestSchema = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail()
];

exports.adminCodeVerifySchema = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    check('code')
        .isLength({ min: 6, max: 6 })
        .withMessage('Code must be 6 characters')
        .isNumeric()
        .withMessage('Code must be numeric')
];