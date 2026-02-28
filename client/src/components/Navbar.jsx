import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
            <div className="navbar-inner">
                <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
                    <span className="navbar-logo-icon">✈️</span>
                    Voyage
                </Link>

                <div className="navbar-links">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                        end
                        id="nav-home"
                    >
                        Home
                    </NavLink>
                    {isAuthenticated ? (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                id="nav-dashboard"
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/create-trip"
                                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                id="nav-create-trip"
                            >
                                Plan Trip
                            </NavLink>

                            <div className="navbar-user">
                                <div className="navbar-avatar" id="nav-avatar">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={handleLogout}
                                    id="nav-logout"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link" id="nav-login">
                                Log in
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm" id="nav-register">
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
