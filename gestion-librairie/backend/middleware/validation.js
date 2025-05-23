const { validationResult } = require('express-validator');

exports.validate = (validations) => {
    return async (req, res, next) => {
        try {
            // Check if validations is an array
            if (!Array.isArray(validations)) {
                throw new Error('Validations must be an array');
            }

            // Run all validations
            await Promise.all(validations.map(validation => validation.run(req)));

            // Check for errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            next();
        } catch (error) {
            console.error('Validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Validation failed',
                error: error.message
            });
        }
    };
};