const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    movieId: {
        type: String, // Storing TMDB ID as string
        required: true,
        index: true
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);
