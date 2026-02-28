import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.email || !form.password) {
            setError('Please fill in all fields.');
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Cannot connect to server. Check your internet connection or try again later.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Request timed out. Your connection may be slow — please try again.');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" id="register-page">
            {/* Left: Image Side */}
            <div className="auth-image-side">
                <img
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=60"
                    alt="Mountain lake landscape"
                    loading="lazy"
                />
                <div className="auth-image-overlay" />
                <div className="auth-image-text">
                    <h2>Start your journey</h2>
                    <p>Create a free account and let our AI plan your next unforgettable adventure in seconds.</p>
                </div>
            </div>

            {/* Right: Form Side */}
            <div className="auth-form-side">
                <div className="auth-card anim-fade-in-up">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="auth-logo-icon">✈️</span>
                            Voyage
                        </Link>
                        <h1 className="auth-title">Create account</h1>
                        <p className="auth-subtitle">Start planning amazing trips with AI in seconds</p>
                    </div>

                    <form className="auth-form-box" onSubmit={handleSubmit} id="register-form">
                        {error && (
                            <div className="auth-alert error" id="register-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="register-name">Full Name</label>
                            <input
                                id="register-name"
                                name="name"
                                type="text"
                                className="form-input"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="register-email">Email</label>
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                name="password"
                                type="password"
                                className="form-input"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
                            <input
                                id="register-confirm"
                                name="confirmPassword"
                                type="password"
                                className="form-input"
                                placeholder="Re-enter your password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            id="register-submit"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner spinner-sm"></span>
                                    Creating account...
                                </>
                            ) : (
                                'Create Account →'
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
