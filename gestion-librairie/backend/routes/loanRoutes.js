const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const { protect } = require("../middleware/authMiddleware"); // Make sure you have this middleware

router.get("/Home", loanController.getLoans);
router.get("/my-loans", protect, loanController.getUserLoans);
router.post("/", protect, loanController.createLoan);
router.put("/:id/return", protect, loanController.returnBook);

module.exports = router;