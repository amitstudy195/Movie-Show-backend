const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const theaterRoutes = require('./src/routes/theaterRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');

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
app.use('/api/schedules', scheduleRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('🎬 Movie Show API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`📡 Server running on port ${PORT}`);
});
