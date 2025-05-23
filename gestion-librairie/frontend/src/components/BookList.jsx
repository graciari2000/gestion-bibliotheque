import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import "../App.css";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (Array.isArray(books)) {
      filterBooks();
    }
  }, [books, searchTerm, selectedGenre]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5001/api/book");

      // Handle different response structures
      let booksData = [];
      if (Array.isArray(res.data)) {
        booksData = res.data;
      } else if (res.data.books && Array.isArray(res.data.books)) {
        booksData = res.data.books;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        booksData = res.data.data;
      } else {
        throw new Error("Invalid data format received from server");
      }

      // Format book images
      const formattedBooks = booksData.map(book => ({
        ...book,
        image: book.image
          ? book.image.startsWith('http')
            ? book.image
            : `/uploads/${book.image}`
          : '/placeholder-book.jpg'
      }));

      setBooks(formattedBooks);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    try {
      let result = [...books];

      // Filter by search term
      if (searchTerm) {
        result = result.filter(book =>
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof book.author === 'object'
            ? book.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            : book.author?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Filter by genre
      if (selectedGenre !== "all") {
        result = result.filter(book => book.genre === selectedGenre);
      }

      setFilteredBooks(result);
    } catch (err) {
      console.error("Error filtering books:", err);
      setFilteredBooks([]);
    }
  };

  const handleBorrow = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5001/api/my-loans",
        { bookId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Livre emprunté avec succès !");
      await fetchBooks();
    } catch (err) {
      console.error("Error borrowing book:", err);
      alert(err.response?.data?.message || "Erreur lors de l'emprunt");
    }
  };

  // Get unique genres
  const genres = ["all"];
  if (Array.isArray(books)) {
    const bookGenres = books
      .map(book => book.genre)
      .filter((genre, index, self) => genre && self.indexOf(genre) === index);
    genres.push(...bookGenres);
  }

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <FaSpinner className="fa-spin" size={30} />
        <p>Chargement des livres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 text-center text-danger">
        <FaExclamationTriangle size={30} />
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchBooks}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 book-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des livres 📚</h2>
        <Link to="/add-book" className="btn btn-success">
          Ajouter un livre
        </Link>
      </div>

      {/* Search and filter section */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par titre ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre === "all" ? "Tous les genres" : genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Book grid */}
      {filteredBooks.length === 0 ? (
        <div className="alert alert-info text-center">
          Aucun livre trouvé avec ces critères
        </div>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <div key={book._id} className="book-card">
              <img
                src={book.image}
                className="book-cover"
                alt={book.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-book.jpg';
                }}
              />
              <div className="book-card-body">
                <h5 className="book-card-title">{book.title}</h5>
                <div className="book-card-text">
                  <p><strong>Auteur:</strong> {typeof book.author === 'object' ? book.author?.name : book.author}</p>
                  <p><strong>Genre:</strong> {book.genre}</p>
                  <p><strong>Disponibles:</strong> {book.copiesAvailable}</p>
                </div>
                {book.summary && (
                  <p className="book-card-summary">
                    {book.summary.substring(0, 100)}...
                  </p>
                )}
              </div>
              <div className="book-card-footer">
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleBorrow(book._id)}
                    disabled={book.copiesAvailable <= 0}
                  >
                    {book.copiesAvailable > 0 ? "Emprunter" : "Indisponible"}
                  </button>
                  <Link
                    to={`/book/${book._id}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;