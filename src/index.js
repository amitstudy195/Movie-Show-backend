const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const theaterRoutes = require('./routes/theaterRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/payments', paymentRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('🎬 Movie Magic API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`📡 Server running on port ${PORT}`);
});
