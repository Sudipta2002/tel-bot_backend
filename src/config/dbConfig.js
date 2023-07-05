const mongoose = require('mongoose');
const { MONGO_URI } = require('./serverConfig');

const connectDB = async() => {
    try {
        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
    }
}

module.exports = connectDB;