import { Link } from "react-router-dom";
import { FaShoppingCart, FaBook } from 'react-icons/fa';
import "../App.css";

const Navbar = () => {
    const token = localStorage.getItem("token");

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <Link className="navbar-brand" to="/">📚 Ma Librairie</Link>

                <div className="d-flex align-items-center ms-auto gap-3">
                    {token ? (
                        <>
                            <Link className="btn btn-light" to="/my-loans">
                                <FaBook size={20} /> Mes emprunts
                            </Link>
                            <button
                                className="btn btn-light"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/";
                                }}
                            >
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="btn btn-light" to="/login">Connexion</Link>
                            <Link className="btn btn-light" to="/register">Inscription</Link>
                        </>
                    )}
                    <Link className="btn btn-light" to="/cart">
                        <FaShoppingCart size={20} />
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;