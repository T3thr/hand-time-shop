import mongoose from "mongoose"

export default async function mongodbConnect() {
    try {
        // Check if we already have a connection
        if (mongoose.connections[0].readyState) {
            return;
        }

        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        await mongoose.connection.syncIndexes()
        console.log('Database Connected!')
    } catch (error) {
        console.error('MongoDB connection error:', error.message)
        // Throw the error to be handled by the calling function
        throw new Error('Failed to connect to MongoDB')
    }
}