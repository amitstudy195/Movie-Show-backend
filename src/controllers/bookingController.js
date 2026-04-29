const Booking = require('../models/Booking');
const User = require('../models/User');

// Helper to parse "27 APR MON" and "10:30 AM" into a Date object
const parseShowDateTime = (dateStr, timeStr) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const [day, month] = dateStr.split(' '); // Ignore "MON"

        // Construct string like "27 APR 2026 10:30 AM"
        const fullDateStr = `${day} ${month} ${currentYear} ${timeStr}`;
        const showDate = new Date(fullDateStr);

        // Safety: If the resulting date is more than 6 months in the past, 
        // it might be meant for next year (e.g. Booking in Dec for Jan)
        if (now.getMonth() === 11 && showDate.getMonth() === 0) {
            showDate.setFullYear(currentYear + 1);
        }

        return showDate;
    } catch (error) {
        return null;
    }
};

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const { movieTitle, posterPath, theaterName, showtime, showDate, seats, totalPrice, bookingId } = req.body;

        // Validation: Check if showtime has already passed
        const showDateTime = parseShowDateTime(showDate, showtime);
        if (showDateTime && showDateTime < new Date()) {
            return res.status(400).json({
                message: 'This show has already started or ended. Please select an upcoming screening.'
            });
        }

        // DOUBLE-BOOKING PROTECTION: Check if any requested seats are already taken
        const existingBookings = await Booking.find({
            movieTitle,
            theaterName,
            showtime,
            showDate,
            status: { $ne: 'cancelled' }
        });

        const alreadyBookedSeats = existingBookings.reduce((acc, b) => [...acc, ...b.seats], []);
        const conflicts = seats.filter(seat => alreadyBookedSeats.includes(seat));

        if (conflicts.length > 0) {
            return res.status(400).json({
                message: `The following seats were just booked by someone else: ${conflicts.join(', ')}. Please select other seats.`
            });
        }

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
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        
        // 1. Mark stale pending bookings as cancelled in MongoDB
        await Booking.updateMany(
            { status: 'pending', createdAt: { $lt: tenMinutesAgo } },
            { $set: { status: 'cancelled' } }
        );

        // 2. Return confirmed bookings OR fresh pending bookings
        const bookings = await Booking.find({ 
            userId: req.user._id,
            $or: [
                { status: 'confirmed' },
                { status: 'pending', createdAt: { $gte: tenMinutesAgo } }
            ]
        }).sort('-createdAt');

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

// @desc    Get booked seats for a specific show
// @route   GET /api/bookings/booked-seats
exports.getBookedSeats = async (req, res) => {
    try {
        const { movieTitle, theaterName, showtime, showDate } = req.query;
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        // 1. Mark stale pending bookings as cancelled in MongoDB
        await Booking.updateMany(
            { status: 'pending', createdAt: { $lt: tenMinutesAgo } },
            { $set: { status: 'cancelled' } }
        );
        
        const bookings = await Booking.find({
            movieTitle,
            theaterName,
            showtime,
            showDate,
            $or: [
                { status: 'confirmed' },
                { status: 'pending', createdAt: { $gte: tenMinutesAgo } }
            ]
        });

        // Extract all seats with their status from matching bookings
        const bookedSeats = bookings.reduce((acc, booking) => {
            booking.seats.forEach(seat => {
                acc.push({ id: seat, status: booking.status });
            });
            return acc;
        }, []);

        res.json(bookedSeats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking counts for all shows of a movie
// @route   GET /api/bookings/counts
exports.getBookingCounts = async (req, res) => {
    try {
        const { movieTitle } = req.query;
        
        const counts = await Booking.aggregate([
            { 
                $match: { 
                    movieTitle, 
                    status: { $ne: 'cancelled' } 
                } 
            },
            {
                $group: {
                    _id: {
                        theaterName: "$theaterName",
                        showtime: "$showtime",
                        showDate: "$showDate"
                    },
                    bookedCount: { $sum: { $size: "$seats" } }
                }
            }
        ]);
        
        res.json(counts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
