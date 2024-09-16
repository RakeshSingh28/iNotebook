require('dotenv').config();  
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

const connectToMongo = async() => {
    await mongoose.connect(mongoURI);
    console.log('Connected to Mongo successfully!');
}

module.exports = connectToMongo;