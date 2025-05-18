const express = require('express');
const profileRouter = express.Router();
const {userAuth} = require("../middleware/auth");
const {validateEditProfileData} = require("../utils/validation");
const user = require("../models/user");
const validator = require("validator");

profileRouter.get('/profile/view',userAuth,async (req,res)=>{
    try{
        
        const u = req.u;
       
        res.send(u);
    }catch(err){
        res.status(400).send("Something wrong:"+err.message);
    }
})
profileRouter.patch('/profile/edit',userAuth,async (req,res)=>{
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
        }
        const loggedInUser = req.u;

        Object.keys(req.body).forEach((key)=>(loggedInUser[key]=req.body[key]));
        await loggedInUser.save();
        res.send(`${loggedInUser.firstName}, your profile updated successfully`);
    }catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
});
profileRouter.post('/profile/password',userAuth,async(req,res)=>{
    try{
       
        res.send("Password Updated successfully..");
    }catch(err){
        res.status(400).send("Error: "+err.message);
    }
});
module.exports = profileRouter;