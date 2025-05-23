const Loan = require("../models/Loan");
const Book = require("../models/Book");

exports.getLoans = async (req, res) => {
    try {
        const loans = await Loan.find().populate('book').populate('user');
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getUserLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ userId: req.user.id }).populate('bookId');

        if (loans.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Vous n'avez emprunté aucun livre pour le moment.",
                count: 0,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Liste des livres empruntés récupérée avec succès.",
            count: loans.length,
            data: loans
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Erreur serveur. Veuillez réessayer plus tard."
        });
    }
};

exports.createLoan = async (req, res) => {
    try {
        const book = await Book.findById(req.body.bookId);
        if (!book) return res.status(404).json({ message: "Livre non trouvé" });
        if (book.copiesAvailable <= 0) return res.status(400).json({ message: "Pas en stock" });

        // Update book copies
        book.copiesAvailable -= 1;
        await book.save();

        const loan = new Loan({
            book: req.body.bookId,
            user: req.user._id,
            loanDate: new Date(),
            returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days later
            returned: false
        });

        await loan.save();
        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.returnBook = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: "Emprunt non trouvé" });
        if (loan.returned) return res.status(400).json({ message: "Déjà retourné" });

        loan.returned = true;
        await loan.save();

        // Update book copies
        const book = await Book.findById(loan.book);
        if (book) {
            book.copiesAvailable += 1;
            await book.save();
        }

        res.json({ message: "Livre retourné" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};