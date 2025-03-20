const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required:true,
        minLength:5,
        
    },
    lastName : {
        type : String,
        
    },
    email : {
        type : String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        
    },
    password : {
        type : String,
       
    },
    age:{
        type:Number,
        min:18,
        
    },
    gender : {
        type : String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender data is not valid");
            }
        },
        
    },
    photoUrl:{
        type:String,
    },
    about:{
        type:String,
        default:"This is a default about of the user!",
    },
    skills:{
        type:[String],
    }
},{
    timestamps:true,
});
module.exports=mongoose.model("users",userSchema);