const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 30000, // Wait 30 seconds for server selection
            connectTimeoutMS: 30000,         // Wait 30 seconds for connection
        };
        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`🚀 MongoDB Connected successfully`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (error.message.includes('ENOTFOUND')) {
            console.log("🛑 CRITICAL: The server cannot resolve the MongoDB hostname. Please check your internet connection or your MONGODB_URI hostname.");
        }
        console.log("👉 Tip: Check your IP Whitelist in MongoDB Atlas dashboard.");
    }
};

module.exports = connectDB;
