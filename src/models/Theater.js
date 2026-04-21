const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    formats: [{
        type: String
    }],
    rows: {
        type: Number,
        default: 8
    },
    cols: {
        type: Number,
        default: 12
    },
    price: {
        type: Number,
        required: true
    },
    distance: {
        type: Number,
        default: 1.0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema);
