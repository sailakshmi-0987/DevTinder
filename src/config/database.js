const mongoose = require('mongoose');

const connectDB = async () =>  {
    await mongoose.connect(
        process.env.MONGO_URL
    );
};
module.exports=connectDB;

//const URL=
   // "mongodb+srv://sailakshmi:tom@7075@dev.ct3gr.mongodb.net/?"
   