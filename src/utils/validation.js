const validator=require('validator');
const validateSignUpData=(req)=>{
    const {firstName,lastName,email,password}=req.body;
    if(!(firstName || lastName)){
        throw new Error("Name is not Valid..");
    }
    else if(!validator.isEmail(email)){
        throw new Error("Email is Invalid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong password!");
    }
}
const validateEditProfileData=(req)=>{
    const allowedProfileUpdates = ["firstName","lastName","gender","age","photoUrl","skills","about"];
    const isEditAllowed = Object.keys(req.body).every((field)=>
        allowedProfileUpdates.includes(field)
    );
    return isEditAllowed;
}
module.exports = {
    validateSignUpData,
    validateEditProfileData,
}