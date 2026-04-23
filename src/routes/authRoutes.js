const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    authUser, 
    getUserProfile, 
    sendOTP, 
    verifyOTP,
    forgotPassword,
    resetPassword,
    toggleLike,
    submitRating
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/profile', protect, getUserProfile);
router.post('/like', protect, toggleLike);
router.post('/rate', protect, submitRating);

module.exports = router;
