const express = require('express');
const router = express.Router();
const { getSchedules, syncSchedules, deleteSchedule } = require('../controllers/scheduleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSchedules);
router.post('/sync', protect, admin, syncSchedules);
router.delete('/:id', protect, admin, deleteSchedule);

module.exports = router;
