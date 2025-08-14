const express = require('express');
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const user = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

authRouter.post('/signup',async (req,res)=>{
    
    try{
        validateSignUpData(req);
        const {firstName,lastName,email,password} = req.body;
        const passwordHash = await bcrypt.hash(password,10);
        const user = new User({
            firstName,
            lastName,
            email,
            password:passwordHash
        
        });
        const savedUser = await user.save();
        const token = await savedUser.getJWT();
        res.cookie("token",token,{
            expires:new Date(Date.now()+8*3600000)
        });
        res.json({message:"user added succesfully",data:savedUser});
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
authRouter.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account with that email" });
        }

        
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

      
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>You requested to reset your password.</p>
                   <p>Click <a href="${resetURL}">here</a> to reset your password. This link is valid for 1 hour.</p>`
        });

        res.json({ message: "Reset link sent to your email" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

authRouter.post('/reset-password/:token', async (req, res) => {
    try {
    const { token } = req.params;
    const { password } = req.body;

   
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

   
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});
authRouter.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body; 
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const {
      sub: googleId,
      email,
      given_name: firstName,
      family_name: lastName,
      picture: photoUrl,
      email_verified,
    } = payload;

    if (!email_verified) {
      return res.status(401).json({ message: "Google email not verified" });
    }

    
    let u = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!u) {
      u = await User.create({
        googleId,
        email,
        firstName: firstName || "Google",
        lastName: lastName || "",
        photoUrl,
        provider: "google",
      });
    } else {
 
      if (!u.googleId) u.googleId = googleId;
      if (!u.provider) u.provider = "google";
      if (!u.photoUrl && photoUrl) u.photoUrl = photoUrl;
      if (!u.firstName && firstName) u.firstName = firstName;
      if (!u.lastName && lastName) u.lastName = lastName;
      await u.save();
    }

    
    const token = await u.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 3600000),
    });

    return res.json({ message: "Logged in with Google", data: u });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ message: "Google auth failed" });
  }
});


module.exports = authRouter;