const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const { movieTitle, posterPath, theaterName, showtime, showDate, seats, totalPrice, bookingId } = req.body;

        const booking = await Booking.create({
            userId: req.user._id,
            userName: req.user.name,
            movieTitle,
            posterPath,
            theaterName,
            showtime,
            showDate,
            seats,
            totalPrice,
            bookingId
        });

        // Add booking reference to user
        await User.findByIdAndUpdate(req.user._id, {
            $push: { bookings: booking._id }
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).sort('-createdAt');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            if (booking.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            
            await booking.deleteOne();
            res.json({ message: 'Booking removed' });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
exports.getAllBookings = async (req, res) => {
    try {
        // Force-fetching EVERY booking in the network for Admin visibility
        const bookings = await Booking.find({}).sort('-createdAt').populate('userId', 'name email');
        console.log(`📡 [ADMIN_SYNC] recovered ${bookings.length} total transactions from database.`);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
