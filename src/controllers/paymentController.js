const Booking = require('../models/Booking');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const notificationService = require('../utils/notificationService');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'missing_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'missing_secret'
});

// @desc    Create Payment Order
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { amount, bookingData } = req.body;
        const { movieTitle, theaterName, showtime, showDate, seats } = bookingData;

        // We only block seats if they are 'confirmed' or 'pending' (created within last 10 mins)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        // 1. Mark stale pending bookings as cancelled in MongoDB
        await Booking.updateMany(
            { status: 'pending', createdAt: { $lt: tenMinutesAgo } },
            { $set: { status: 'cancelled' } }
        );

        const existingBookings = await Booking.find({
            movieTitle,
            theaterName,
            showtime,
            showDate,
            $or: [
                { status: 'confirmed' },
                { status: 'pending', createdAt: { $gte: tenMinutesAgo } }
            ]
        });

        const alreadyBookedSeats = existingBookings.reduce((acc, b) => [...acc, ...b.seats], []);
        const conflicts = seats.filter(seat => alreadyBookedSeats.includes(seat));

        if (conflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Seats ${conflicts.join(', ')} were just reserved by another user.`,
                error: "SEAT_CONFLICT"
            });
        }

        let orderId;
        let isMock = true;

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error(`Invalid amount received: ${amount}`);
        }

        try {
            const hasRealKeys = process.env.RAZORPAY_KEY_ID &&
                process.env.RAZORPAY_KEY_ID.includes('rzp_');

            if (hasRealKeys) {
                const razorOrder = await razorpay.orders.create({
                    amount: Math.round(numericAmount * 100),
                    currency: "INR",
                    receipt: `receipt_${Date.now()}`
                });
                orderId = razorOrder.id;
                isMock = false;
            } else {
                orderId = "mock_order_" + Math.random().toString(36).substr(2, 9).toUpperCase();
                isMock = true;
            }
        } catch (rzpErr) {
            console.error('❌ RAZORPAY_ORDER_API_ERROR:', rzpErr);
            // Razorpay errors often contain detailed info in rzpErr.error
            const detail = rzpErr.error?.description || rzpErr.message || "Failed to create order";
            throw new Error(`Razorpay API Error: ${detail}`);
        }

        // Generate a unique Booking ID (satisfied required schema field)
        const generatedBookingId = "BK-" + Math.random().toString(36).substr(2, 6).toUpperCase();

        // 2. Create a pending booking in our DB
        let booking;
        try {
            booking = await Booking.create({
                ...bookingData,
                userId: req.user._id,
                userName: req.user.name,
                totalPrice: amount,
                orderId: orderId,
                bookingId: generatedBookingId,
                status: 'pending'
            });
        } catch (dbErr) {
            console.error('❌ DATABASE_CREATE_BOOKING_ERROR:', dbErr);
            throw new Error(`Database Error: ${dbErr.message || "Failed to record booking"}`);
        }

        res.status(201).json({
            success: true,
            orderId: orderId,
            amount: amount * 100,
            currency: "INR",
            bookingId: booking._id,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            isMock: isMock
        });
    } catch (err) {
        console.error('🕵️ PAYMENT_ORDER_CRASH:', {
            message: err.message,
            stack: err.stack,
            razorpay_error: err.error // Razorpay specific error object
        });
        res.status(500).json({
            success: false,
            message: 'Error initiating transaction.',
            error: err.message
        });
    }
};

// @desc    Verify Payment Signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // 1. Signature check (Automatically pass if it's a mock order)
        let isVerified = false;
        if (razorpay_order_id && razorpay_order_id.startsWith('mock_order_')) {
            isVerified = true;
        } else {
            const generated_signature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            isVerified = (generated_signature === razorpay_signature || process.env.NODE_ENV === 'development');
        }

        // 2. Compare signatures
        if (isVerified) {
            const booking = await Booking.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'confirmed', paymentId: razorpay_payment_id },
                { returnDocument: 'after' }
            );

            if (!booking) {
                return res.status(404).json({ message: 'Booking reference not found' });
            }

            // 3. Trigger cinematic notifications
            try {
                notificationService.sendEmailConfirmation(req.user.email, booking);
            } catch (notifErr) {
                console.error("Non-blocking notification error:", notifErr);
            }

            res.json({
                success: true,
                message: 'Payment verified securely',
                booking
            });
        } else {
            res.status(400).json({ success: false, message: 'Security Breach: Invalid payment signature' });
        }
    } catch (err) {
        console.error('Razorpay Verification Error:', err);
        res.status(500).json({ message: 'Transaction verification failure' });
    }
};
