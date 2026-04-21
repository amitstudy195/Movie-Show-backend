/**
 * Administrator Promotion Script
 * Usage: node src/utils/promoteUser.js your-email@example.com
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const promote = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Please provide an email address.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_show');
        
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { isAdmin: true },
            { new: true }
        );

        if (!user) {
            console.error('❌ User not found.');
        } else {
            console.log(`\n🚀 SUCCESS: User ${user.email} has been promoted to administrator!`);
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        mongoose.connection.close();
    }
};

promote();
