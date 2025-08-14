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
profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.u;
        const allowedFields = ["firstName", "lastName", "age", "gender", "about", "skills", "photoUrl"];

        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                loggedInUser[key] = req.body[key];
            }
        });

        await loggedInUser.save();

        res.status(200).json({
            message: `${loggedInUser.firstName}, your profile was updated successfully`,
            user: loggedInUser
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
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