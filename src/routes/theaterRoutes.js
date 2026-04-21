const express = require('express');
const router = express.Router();
const { getTheaters, createTheater, seedTheaters } = require('../controllers/theaterController');

router.get('/', getTheaters);
router.post('/', createTheater);
router.post('/seed', seedTheaters);

module.exports = router;
