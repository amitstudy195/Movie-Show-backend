const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTheaters);
router.post('/', protect, admin, createTheater);
router.post('/seed', protect, admin, seedTheaters);

module.exports = router;
