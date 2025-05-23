const mongoose = require('mongoose');

const AdminCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '60m' } // Auto-delete after 15 minutes
    },
    attempts: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminCode', AdminCodeSchema);