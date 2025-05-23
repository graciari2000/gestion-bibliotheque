import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Cart = () => {
    const { id } = useParams(); // Get the book ID from the URL
    const [book, setBook] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5001/api/books/${id}`)
            .then((res) => setBook(res.data))
            .catch((err) => console.error("Error fetching book:", err));
    }, [id]);

    if (!book) return <p>Chargement du livre...</p>;

    return (
        <div className="container mt-4">
            <h2>Panier 🛒</h2>
            <div className="book-card">
                <img src={book.image} alt={book.title} style={{ maxWidth: "200px" }} />
                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <p>{book.price} €</p>
                <button className="btn btn-success">Procéder au paiement</button>
            </div>
        </div>
    );
};

export default Cart;
