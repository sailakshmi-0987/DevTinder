const mongoose = require('mongoose');

const connectDB = async () =>  {
    await mongoose.connect(
        "mongodb+srv://sailakshmi:tom%407075@dev.ct3gr.mongodb.net/devTinder"
    );
};
module.exports=connectDB;

//const URL=
   // "mongodb+srv://sailakshmi:tom@7075@dev.ct3gr.mongodb.net/?"
   