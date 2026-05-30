import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('voyage_token');
            const savedUser = localStorage.getItem('voyage_user');

            if (token && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch {
                    localStorage.removeItem('voyage_token');
                    localStorage.removeItem('voyage_user');
                }

                try {
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                    localStorage.setItem('voyage_user', JSON.stringify(response.data.user));
                } catch {
                    localStorage.removeItem('voyage_token');
                    localStorage.removeItem('voyage_user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = useCallback(async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { token, user: userData } = response.data;
        localStorage.setItem('voyage_token', token);
        localStorage.setItem('voyage_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const response = await authAPI.register({ name, email, password });
        const { token, user: userData } = response.data;
        localStorage.setItem('voyage_token', token);
        localStorage.setItem('voyage_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('voyage_token');
        localStorage.removeItem('voyage_user');
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
