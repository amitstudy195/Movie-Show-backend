const express = require('express');
const router = express.Router();
const { getTheaters, createTheater, seedTheaters, updateTheater, deleteTheater } = require('../controllers/theaterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTheaters);
router.post('/', protect, admin, createTheater);
router.post('/seed', protect, admin, seedTheaters);
router.route('/:id')
    .put(protect, admin, updateTheater)
    .delete(protect, admin, deleteTheater);

module.exports = router;
