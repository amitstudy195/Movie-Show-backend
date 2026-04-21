const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    posterPath: String,
    theaterName: {
        type: String,
        required: true
    },
    showtime: {
        type: String,
        required: true
    },
    showDate: {
        type: String,
        required: true
    },
    seats: [{
        type: String,
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentId: String,
    orderId: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
