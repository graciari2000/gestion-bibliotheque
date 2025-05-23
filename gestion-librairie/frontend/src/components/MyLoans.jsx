import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const MyLoans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [returning, setReturning] = useState(null); // Track which loan is being returned
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchLoans = async () => {
            try {
                setError(null);
                setLoading(true);
                const res = await axios.get("http://localhost:5001/api/loan/my-loans", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Handle both array and object responses
                const loanData = Array.isArray(res.data) ? res.data : res.data.data || [];
                setLoans(loanData);
            } catch (err) {
                console.error("Error fetching loans:", err);
                setError(err.response?.data?.message ||
                    err.message ||
                    "Erreur lors du chargement des emprunts");
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, [navigate]);

    const handleReturn = async (loanId) => {
        try {
            setReturning(loanId);
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5001/api/loans/${loanId}/return`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setLoans(loans.map(loan =>
                loan._id === loanId ? { ...loan, returned: true, returnDate: new Date() } : loan
            ));
        } catch (err) {
            console.error("Error returning book:", err);
            setError(err.response?.data?.message ||
                err.message ||
                "Erreur lors du retour du livre");
        } finally {
            setReturning(null);
        }
    };

    if (loading) {
        return (
            <><Navbar /><div className="container mt-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </div></>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => window.location.reload()}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Mes emprunts 📚</h2>

            {loans.length === 0 ? (
                <div className="text-center py-5">
                    <img
                        src="/empty-bookshelf.png"
                        alt="Empty bookshelf"
                        className="img-fluid mb-3"
                        style={{ maxWidth: "300px" }}
                    />
                    <h4>Vous n'avez aucun livre emprunté</h4>
                    <p className="text-muted">
                        Parcourez notre collection pour trouver votre prochaine lecture !
                    </p>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={() => navigate("/books")}
                    >
                        Voir les livres disponibles
                    </button>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {loans.map((loan) => (
                        <div key={loan._id} className="col">
                            <div className="card h-100">
                                {loan.book?.image && (
                                    <img
                                        src={`http://localhost:5001/uploads/${loan.book.image}`}
                                        alt={loan.book.title}
                                        className="card-img-top"
                                        style={{
                                            height: "200px",
                                            objectFit: "cover"
                                        }}
                                    />
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{loan.book?.title || "Livre inconnu"}</h5>
                                    <div className="card-text mb-3">
                                        <p>
                                            <strong>Auteur:</strong> {loan.book?.author || "Inconnu"}
                                        </p>
                                        <p>
                                            <strong>Emprunté le:</strong> {new Date(loan.loanDate).toLocaleDateString()}
                                        </p>
                                        {loan.returnDate && (
                                            <p>
                                                <strong>À retourner avant:</strong> {new Date(loan.returnDate).toLocaleDateString()}
                                            </p>
                                        )}
                                        <p>
                                            <strong>Statut:</strong>{" "}
                                            <span className={`badge ${loan.returned ? "bg-success" : "bg-warning"}`}>
                                                {loan.returned ? "Retourné" : "En cours"}
                                            </span>
                                        </p>
                                    </div>
                                    {!loan.returned && (
                                        <button
                                            className="btn btn-primary mt-auto"
                                            onClick={() => handleReturn(loan._id)}
                                            disabled={returning === loan._id}
                                        >
                                            {returning === loan._id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Retour en cours...
                                                </>
                                            ) : (
                                                "Retourner ce livre"
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLoans;