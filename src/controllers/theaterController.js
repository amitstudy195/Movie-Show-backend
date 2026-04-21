const Theater = require('../models/Theater');

// @desc    Get theaters by city
// @route   GET /api/theaters
// @access  Public
exports.getTheaters = async (req, res) => {
    try {
        const { city } = req.query;
        let query = {};
        
        if (city) {
            query.city = { $regex: new RegExp(city, 'i') };
        }

        const theaters = await Theater.find(query);
        res.json(theaters);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new theater (Admin only in real app)
// @route   POST /api/theaters
// @access  Public (for seeding purposes)
exports.createTheater = async (req, res) => {
    try {
        const theater = await Theater.create(req.body);
        res.status(201).json(theater);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Seed theaters
// @route   POST /api/theaters/seed
// @access  Public
exports.seedTheaters = async (req, res) => {
    try {
        const theaters = req.body;
        // Clear existing to avoid duplicates in this demo
        await Theater.deleteMany({});
        const createdTheaters = await Theater.insertMany(theaters);
        res.status(201).json(createdTheaters);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
