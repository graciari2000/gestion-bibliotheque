const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },
    genre: { type: String, required: true },
    summary: String,
    copiesAvailable: { type: Number, default: 1, min: 0 },
    image: {
        type: String,
        validate: {
            validator: function (v) {
                // Allow either URLs or simple filenames
                return /^(http|https):\/\//.test(v) ||
                    /^[a-z0-9\-_.]+\.(jpg|jpeg|png|webp)$/i.test(v);
            },
            message: 'Image must be a valid URL or filename'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);