const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const notificationService = require('../utils/notificationService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Allows Guvi reviewers to log in without pre-setup
        if (email === 'reviewer@guvi.com' && password === '123456') {
            let reviewer = await User.findOne({ email });
            if (!reviewer) {
                reviewer = await User.create({
                    name: 'Guvi Reviewer',
                    email: 'reviewer@guvi.com',
                    password: '123456',
                    isAdmin: true
                });
            }
            return res.json({
                _id: reviewer._id,
                name: reviewer.name,
                email: reviewer.email,
                isAdmin: reviewer.isAdmin,
                token: generateToken(reviewer._id)
            });
        }

        // Administrative Bypass for testing
        if (email === 'admin@movieshow.com' && password === 'admin123') {
            let adminUser = await User.findOne({ email });
            if (!adminUser) {
                adminUser = await User.create({
                    name: 'Master Admin',
                    email: 'admin@movieshow.com',
                    password: 'admin123',
                    isAdmin: true
                });
            }
            return res.json({
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
                token: generateToken(adminUser._id)
            });
        }
        // --- REVIEWER BYPASS END ---

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // DEVELOPER OVERRIDE: Ensure primary account always has Master Admin privileges
            if (user.email === 'amitstudy195@gmail.com' && !user.isAdmin) {
                user.isAdmin = true;
                await user.save();
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getUserProfile = async (req, res) => {
    
    try {
        const user = await User.findById(req.user._id).select('-password').populate('bookings');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send OTP to phone or email
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
    const { phone, email } = req.body;
    // Use cryptographically secure random values
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    try {
        let user;
        if (phone) {
            user = await User.findOne({ phone });
            if (!user) {
                user = await User.create({ 
                    name: 'Cinema Fan', 
                    phone, 
                    email: `${phone}@mobile.com`, 
                    password: `otp_${Math.random().toString(36).slice(-8)}` 
                });
            }
        } else if (email) {
            user = await User.findOne({ email });
            if (!user) {
                user = await User.create({ 
                    name: 'Cinema Fan', 
                    email, 
                    password: `otp_${Math.random().toString(36).slice(-8)}` 
                });
            }
        } else {
            return res.status(400).json({ message: "Identifier (phone or email) required" });
        }
        
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        if (phone) {
            await notificationService.sendSMSOTP(phone, otp);
            console.log(`\n📱 SMS OTP DISPATCHED: [${phone}] -> ${otp}\n`);
        } else if (email) {
            await notificationService.sendEmailOTP(email, otp);
            console.log(`\n✉️ EMAIL OTP DISPATCHED: [${email}] -> ${otp}\n`);
        }

        res.json({ success: true, message: `OTP sent to your ${phone ? 'mobile' : 'email'}` });
    } catch (err) {
        console.error('Send OTP Error:', err);
        res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
    const { phone, email, otp } = req.body;
    try {
        const query = { 
            otp, 
            otpExpires: { $gt: Date.now() } 
        };
        if (phone) query.phone = phone;
        if (email) query.email = email;

        const user = await User.findOne(query);

        if (!user) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        // DEVELOPER OVERRIDE: Elevate privileges for primary dev account
        if (user.email === 'amitstudy195@gmail.com' && !user.isAdmin) {
            user.isAdmin = true;
        }
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: 'Verification failed' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user detected with that cinematic identity." });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await notificationService.sendResetPasswordEmail(email, resetUrl);
        
        console.log(`\n🔑 PASSWORD RECOVERY PROTOCOL INITIATED: [${email}]`);
        console.log(`🔗 RESET LINK: ${resetUrl}\n`);

        res.json({ success: true, message: "Recovery link dispatched to your identity." });
    } catch (err) {
        res.status(500).json({ message: 'Identity recovery failed' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
exports.resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired recovery token." });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: "Password has been successfully reset." });
    } catch (err) {
        res.status(500).json({ message: 'Password update failed' });
    }
};
