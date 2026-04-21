const Booking = require('../models/Booking');
const crypto = require('crypto');

// @desc    Create Payment Order (Mocking Razorpay/Stripe behavior)
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { amount, bookingData } = req.body;
        
        // In a real app, you would call Razorpay: 
        // const order = await razorpay.orders.create({ amount: amount * 100, ... })
        const mockOrderId = "order_" + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Create a pending booking
        const booking = await Booking.create({
            ...bookingData,
            userId: req.user._id, 
            userName: req.user.name,
            totalPrice: amount,
            orderId: mockOrderId,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            orderId: mockOrderId,
            amount: amount,
            bookingId: booking._id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating payment order' });
    }
};

const notificationService = require('../utils/notificationService');

// @desc    Verify Payment Signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // MOCK VERIFICATION LOGIC:
        const isVerified = true; 

        if (isVerified) {
            const booking = await Booking.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'confirmed', paymentId: razorpay_payment_id },
                { new: true }
            );

            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            // TRIGGER AUTOMATED NOTIFICATIONS (Async - Don't wait for response)
            notificationService.sendEmailConfirmation(req.user.email, booking);
            if (req.user.phone) {
                notificationService.sendSMSConfirmation(req.user.phone, booking);
            }

            res.json({ success: true, message: 'Payment verified successfully', booking });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Verification error' });
    }
};
