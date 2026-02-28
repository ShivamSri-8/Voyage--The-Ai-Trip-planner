import axios from 'axios';

// Auto-detect API URL:
// 1. Use VITE_API_URL env var if set (for production/custom deployments)
// 2. If accessing from localhost, use localhost:5000
// 3. If accessing from another device (e.g., phone on LAN), use the same hostname with port 5000
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    const { hostname, protocol } = window.location;
    return `${protocol}//${hostname}:5000/api`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60s timeout — generous for AI generation on slow networks
});

// Attach the JWT token to every request if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('voyage_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses globally (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('voyage_token');
            localStorage.removeItem('voyage_user');
            // Only redirect if not already on auth pages
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ===== Auth API =====
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// ===== Trip API =====
export const tripAPI = {
    generateTrip: (data) => api.post('/generate-trip', data),
    getTrips: () => api.get('/trips'),
    getTripById: (id) => api.get(`/trips/${id}`),
    deleteTrip: (id) => api.delete(`/trips/${id}`),
};

// ===== Mappls API =====
export const mapplsAPI = {
    getToken: () => api.get('/mappls/token'),
    searchPlaces: (query) => api.get(`/mappls/search?query=${encodeURIComponent(query)}`),
};

export default api;
