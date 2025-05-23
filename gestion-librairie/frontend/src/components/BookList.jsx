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
      const res = await axios.get("http://localhost:5001/api/books");

      // Debug: Log the full response
      console.log("API Response:", res.data);

      // Handle different response structures
      if (Array.isArray(res.data)) {
        // If response is directly an array
        setBooks(res.data);
      } else if (res.data.books && Array.isArray(res.data.books)) {
        // If response is { books: [...] }
        setBooks(res.data.books);
      } else if (res.data.data && Array.isArray(res.data.data)) {
        // If response is { data: [...] }
        setBooks(res.data.data);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    try {
      let result = [...books]; // Create a copy of the books array

      // Filter by search term
      if (searchTerm) {
        result = result.filter(book =>
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase())
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
        "http://localhost:5001/api/loan/my-loans",
        { bookId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Livre emprunté avec succès !");
      await fetchBooks(); // Refresh the book list
    } catch (err) {
      console.error("Error borrowing book:", err);
      alert(err.response?.data?.message || "Erreur lors de l'emprunt");
    }
  };

  // Safely get unique genres
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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des livres 📚</h2>
        <Link to="/add-book" className="btn btn-success">
          Ajouter un livre
        </Link>
      </div>

      {/* Search and filter section */}
      <div className="row mb-4">
        <div className="col-md-6">
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

      {/* Book list */}
      {filteredBooks.length === 0 ? (
        <div className="alert alert-info">Aucun livre trouvé</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {filteredBooks.map((book) => (
            <div key={book._id} className="col">
              <div className="card h-100">
                <img
                  src={`http://localhost:5001/uploads/${book.image}`}
                  className="card-img-top book-cover"
                  alt={book.title}
                />
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">
                    <strong>Auteur:</strong> {book.author}<br />
                    <strong>Genre:</strong> {book.genre}<br />
                    <strong>Disponibles:</strong> {book.copiesAvailable}
                  </p>
                  {book.summary && (
                    <p className="card-text text-muted">
                      {book.summary.substring(0, 100)}...
                    </p>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleBorrow(book._id)}
                      disabled={book.copiesAvailable <= 0}
                    >
                      {book.copiesAvailable > 0 ? "Emprunter" : "Indisponible"}
                    </button>
                    <Link
                      to={`/cart/${book._id}`}
                      className="btn btn-outline-secondary"
                    >
                      Détails
                    </Link>
                  </div>
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