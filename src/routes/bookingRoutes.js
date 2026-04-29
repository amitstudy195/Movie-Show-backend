const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, getAllBookings, getBookedSeats, getBookingCounts } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getAllBookings)
    .post(protect, createBooking);

router.route('/booked-seats')
    .get(getBookedSeats);

router.route('/counts')
    .get(getBookingCounts);

router.route('/my')
    .get(protect, getMyBookings);

router.route('/:id')
    .delete(protect, cancelBooking);

module.exports = router;
