import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5001/api/auth/login",
                credentials
            );
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userRole", response.data.role); // Store user role
            navigate("/my-loans");
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de connexion");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Connexion 🔐</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="form-control mb-3"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    className="form-control mb-3"
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="btn btn-primary">
                    Se connecter
                </button>
                <div className="mt-3">
                    <Link to="/register" className="btn btn-link">
                        Pas de compte ? Inscrivez-vous ici !
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;