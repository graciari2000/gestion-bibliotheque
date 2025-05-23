const Book = require("../models/Book");

// Get all books
exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find().populate('author');
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author');
        if (!book) return res.status(404).json({ message: "Livre introuvable" });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new book
exports.createBook = async (req, res) => {
    try {
        const newBook = new Book({
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            summary: req.body.summary,
            copiesAvailable: req.body.copiesAvailable
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update book
exports.updateBook = async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                author: req.body.author,
                genre: req.body.genre,
                summary: req.body.summary,
                copiesAvailable: req.body.copiesAvailable
            },
            { new: true }
        ).populate('author');

        if (!updatedBook) return res.status(404).json({ message: "Livre introuvable" });
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) return res.status(404).json({ message: "Livre introuvable" });
        res.json({ message: "Livre supprimé" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};