const express = require('express');
const {
    register,
    login,
    requestAdminCode,
    verifyAdminCode
} = require('../controllers/authController');
const router = express.Router();
const { validate } = require('../middleware/validation');
const {
    registerSchema,
    loginSchema,
    adminCodeRequestSchema,
    adminCodeVerifySchema
} = require('../validations/authValidation');

// Public auth routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/request-admin-code', validate(adminCodeRequestSchema), requestAdminCode);
router.post('/verify-admin-code', validate(adminCodeVerifySchema), verifyAdminCode); // New verification endpoint

module.exports = router;