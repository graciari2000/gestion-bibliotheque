const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    loanDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    returned: { type: Boolean, default: false },
});

module.exports = mongoose.model("Loan", loanSchema);