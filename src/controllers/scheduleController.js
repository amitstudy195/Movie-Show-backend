const Schedule = require('../models/Schedule');

// @desc    Get all schedules or filter by movie
// @route   GET /api/schedules
exports.getSchedules = async (req, res) => {
    try {
        const { movieId } = req.query;
        let query = {};
        if (movieId) query.movieId = movieId;

        const schedules = await Schedule.find(query).populate('theaterId');
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create or Update schedules (Bulk or Single)
// @route   POST /api/schedules/sync
exports.syncSchedules = async (req, res) => {
    try {
        const { schedules } = req.body;
        
        // Simple strategy for this project: Clear and reload or update by ID
        // To keep it simple for the user, we'll process each
        const results = [];
        for (const s of schedules) {
            if (!s.movieId || !s.theaterId || !s.time) continue;
            
            // Map 'id' from frontend to '_id' or use existing
            const scheduleData = {
                movieId: s.movieId.toString(),
                theaterId: s.theaterId,
                time: s.time
            };

            // If it has a MongoDB ID or a numeric temp ID we check
            let existing;
            if (s._id) {
                existing = await Schedule.findByIdAndUpdate(s._id, scheduleData, { new: true });
            } else {
                existing = await Schedule.create(scheduleData);
            }
            results.push(existing);
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Remove a schedule
// @route   DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Showtime decommissioned.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
