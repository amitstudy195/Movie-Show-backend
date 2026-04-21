const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    loyaltyPoints: {
        type: Number,
        default: 1500
    },
    membershipTier: {
        type: String,
        enum: ['Club', 'Superstar', 'Elite'],
        default: 'Superstar'
    },
    walletBalance: {
        type: Number,
        default: 1250.00
    },
    coupons: [{
        code: String,
        discount: Number,
        description: String,
        expiryDate: Date
    }],
    interests: {
        genres: [String],
        languages: [String]
    },
    address: {
        line1: String,
        city: String,
        zip: String
    },
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
