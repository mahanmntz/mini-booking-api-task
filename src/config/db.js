const mongoose = require('mongoose');

async function connectDB(uri){
    if(!uri){
        throw new Error('MONGO_URI is not defined in the environment variables');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

}
module.exports = connectDB;