import { useState } from "react";
import axios from "axios";

const BookForm = () => {
    const [book, setBook] = useState({
        title: "",
        author: "",
        genre: "",
        price: "",
        summary: "",
        copiesAvailable: ""
    });
    const [image, setImage] = useState(null);

    const handleChange = (e) => setBook({ ...book, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("image", image);
        Object.keys(book).forEach(key => {
            formData.append(key, book[key]);
        });

        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5001/api/books", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Livre ajouté avec succès !");
            setBook({ title: "", author: "", genre: "", price: "", summary: "", copiesAvailable: "" });
            setImage(null);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout du livre");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Ajouter un livre 📖</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Titre" className="form-control" onChange={handleChange} value={book.title} required />
                <input type="text" name="author" placeholder="Auteur" className="form-control mt-2" onChange={handleChange} value={book.author} required />
                <input type="text" name="genre" placeholder="Genre" className="form-control mt-2" onChange={handleChange} value={book.genre} required />
                <input type="number" name="price" placeholder="Prix (€)" className="form-control mt-2" onChange={handleChange} value={book.price} required />
                <input type="number" name="copiesAvailable" placeholder="Exemplaires disponibles" className="form-control mt-2" onChange={handleChange} value={book.copiesAvailable} required />
                <textarea name="summary" placeholder="Résumé" className="form-control mt-2" onChange={handleChange} value={book.summary} required />
                <input type="file" name="image" className="form-control mt-2" onChange={(e) => setImage(e.target.files[0])} required />
                <button type="submit" className="btn btn-success mt-3">Ajouter</button>
            </form>
        </div>
    );
};

export default BookForm;