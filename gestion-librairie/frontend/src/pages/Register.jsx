import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: import.meta.env.VITE_DEFAULT_USER_ROLE || 'member', // Updated environment variable access
        adminCode: ''
    });
    const [step, setStep] = useState(1); // 1: registration, 2: admin verification
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Use environment variable for API base URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAdminCodeRequest = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/request-admin-code`, {
                email: formData.email
            });
            if (response.data.success) {
                setStep(2);
            }
        } catch (err) {
            setErrors({
                admin: err.response?.data?.message || 'Failed to send verification code'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);
            navigate(response.data.role === 'admin' ? '/admin/dashboard' : '/');
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ form: err.response?.data?.message || 'Registration failed' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">
                                {step === 1 ? 'Create Account' : 'Admin Verification'}
                            </h2>

                            {errors.form && (
                                <div className="alert alert-danger">{errors.form}</div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    formData.role === 'admin'
                                        ? handleAdminCodeRequest()
                                        : handleSubmit(e);
                                }}>
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">{errors.name}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">{errors.email}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={formData.password}
                                            onChange={handleChange}
                                            minLength="6"
                                            required
                                        />
                                        {errors.password && (
                                            <div className="invalid-feedback">{errors.password}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Account Type</label>
                                        <div className="d-flex gap-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="role"
                                                    id="memberRole"
                                                    value="member"
                                                    checked={formData.role === 'member'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="memberRole">
                                                    Regular User
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="role"
                                                    id="adminRole"
                                                    value="admin"
                                                    checked={formData.role === 'admin'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="adminRole">
                                                    Administrator
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processing...' : 'Continue'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="alert alert-info">
                                        We've sent a verification code to {formData.email}.
                                        <br />
                                        <small>Check your spam folder if you don't see it.</small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Verification Code</label>
                                        <input
                                            type="text"
                                            name="adminCode"
                                            className={`form-control ${errors.adminCode ? 'is-invalid' : ''}`}
                                            value={formData.adminCode}
                                            onChange={handleChange}
                                            placeholder="Enter 6-digit code"
                                            required
                                        />
                                        {errors.adminCode && (
                                            <div className="invalid-feedback">{errors.adminCode}</div>
                                        )}
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary flex-grow-1"
                                            onClick={() => setStep(1)}
                                            disabled={isLoading}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-grow-1"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Verifying...' : 'Complete Registration'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="mt-3 text-center">
                                <p className="mb-0">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-decoration-none">
                                        Sign in
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;