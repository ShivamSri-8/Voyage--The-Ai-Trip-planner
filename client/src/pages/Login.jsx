import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Cannot connect to server. Check your internet connection or try again later.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Request timed out. Your connection may be slow — please try again.');
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" id="login-page">
            {/* Left: Image Side */}
            <div className="auth-image-side">
                <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
                    alt="Beautiful tropical beach"
                    loading="lazy"
                />
                <div className="auth-image-overlay" />
                <div className="auth-image-text">
                    <h2>Welcome back, traveler</h2>
                    <p>Sign in to continue planning your adventures and access your saved trip itineraries.</p>
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
                        <h1 className="auth-title">Sign in</h1>
                        <p className="auth-subtitle">Enter your credentials to access your account</p>
                    </div>

                    <form className="auth-form-box" onSubmit={handleSubmit} id="login-form">
                        {error && (
                            <div className="auth-alert error" id="login-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            id="login-submit"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner spinner-sm"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In →'
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
