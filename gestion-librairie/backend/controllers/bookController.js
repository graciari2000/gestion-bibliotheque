const Book = require("../models/Book");
const path = require('path');
const fs = require('fs');

// Helper function to delete old image file
const deleteOldImage = async (imagePath) => {
    if (imagePath && !imagePath.startsWith('http')) {
        const fullPath = path.join(__dirname, '../uploads', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

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
            copiesAvailable: req.body.copiesAvailable,
            image: req.body.image
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
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Livre introuvable" });

        // Delete old image if it's being replaced
        if (req.body.image && book.image !== req.body.image) {
            await deleteOldImage(book.image);
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                author: req.body.author,
                genre: req.body.genre,
                summary: req.body.summary,
                copiesAvailable: req.body.copiesAvailable,
                image: req.body.image
            },
            { new: true }
        ).populate('author');

        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Livre introuvable" });

        // Delete associated image file
        await deleteOldImage(book.image);

        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Livre supprimé" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};