require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const theaterRoutes = require('./src/routes/theaterRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🛡️ Security Headers for Production Handshakes (Fixes COOP/COEP issues)
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); 
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/schedules', scheduleRoutes);

// Base route with Health Check
app.get('/', (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    res.json({
        message: '🎬 Movie Show API is running...',
        database: dbStatus,
        mode: process.env.NODE_ENV || 'development'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`📡 Server running on port ${PORT}`);
});
