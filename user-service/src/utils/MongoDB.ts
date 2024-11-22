import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import mongoose from 'mongoose';

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/users';

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);  // Exit the process if the connection fails
    }
};
