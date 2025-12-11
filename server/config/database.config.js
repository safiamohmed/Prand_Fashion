const mongoose = require('mongoose')
const connectDB = async ()=>{
    try{
        const connectionString = process.env.MONGO_URI;
    await mongoose.connect(connectionString);
    console.log('mongoDB connected');
    }catch(err){
        console.log(err.message);
        
    }
    
}
module.exports = connectDB;