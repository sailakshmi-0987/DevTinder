const express = require('express');
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const user = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

authRouter.post('/signup',async (req,res)=>{
    
    try{
        validateSignUpData(req);
        const {firstName,lastName,email,password,age,gender,about,photoUrl} = req.body;
        const passwordHash = await bcrypt.hash(password,10);
        const user = new User({
            firstName,
            lastName,
            email,
            age,
            gender,
            about,
            photoUrl,
            password:passwordHash,
        });
        await user.save();
        res.send("user added succesfully");
    }catch (err) {
        res.status(400).send("Error adding the user:" + err.message);
    }
});

authRouter.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body;
        const u = await user.findOne({email:email});
        if(!u){
            throw new error("Invalid Credentials");
        }
        const isPasswordValid = await u.validatePassword(password);
        if(isPasswordValid){
            const token = await u.getJWT();
            res.cookie("token",token);
            res.send(u);
        }else{
            throw new Error("Password not correct!");
        }
    }catch(err){
        res.status(400).send("Something wrong:"+err.message);
    }
});
authRouter.post('/logout',async (req,res)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    });
    res.send("logout successful");
});
module.exports = authRouter;