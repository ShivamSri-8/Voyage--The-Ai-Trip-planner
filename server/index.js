const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// CORS: allow all origins in development so phone/LAN access works
app.use(cors({
    origin: true, // reflects the requesting origin — works for any device
    credentials: true,
}));

// Gzip compression — critical for mobile data performance
app.use(compression());

app.use(express.json({ limit: '10mb' }));

// Health check (public — must be before protected routes)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Voyage API is running 🚀' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/tripRoutes'));
app.use('/api/mappls', require('./routes/mapplsRoutes'));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});

const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 so the server is accessible from other devices on the network (phone, tablet)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Voyage Server running on port ${PORT}`);
    console.log(`📱 Accessible at http://localhost:${PORT} and on your LAN IP`);
});
