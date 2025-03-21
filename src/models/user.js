const mongoose = require('mongoose');
const validator=require('validator');
const jwt= require("jsonwebtoken");
const bcrypt = require("bcrypt");
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
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email");
            }
        },
        
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
}
);
userSchema.methods.getJWT = async function(){
    const u = this;
    
    const token = await jwt.sign({_id:u._id},"tom@7075",{
        expiresIn:"7d",
    });;
    return token
};
userSchema.methods.validatePassword = async function(passwordInput){
    const u= this;
    const passwordHash = u.password;

    const isPasswordValid = await bcrypt.compare(
        passwordInput, 
        passwordHash
    );
    return isPasswordValid;
};
module.exports=mongoose.model("users",userSchema);