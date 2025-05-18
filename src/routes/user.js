const express = require("express");
const userRouter = express.Router();

const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { set } = require("mongoose");
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
userRouter.get("/user/requests/received",userAuth,async(req,res)=>{
    try{
        const loggedInUser = req.u;
        const connectionRequests = await ConnectionRequest.find({
            toUserId:loggedInUser._id,
            status:"interested",
        }).populate("fromUserId",["firstName","lastName"]);
        res.json({
            message:"Data fetched sucessfully",
            data:connectionRequests,
        })
    }catch(err){
        res.status(400).send("ERROR"+err.message);
    }
});
userRouter.get("/user/connections",userAuth,async(req,res)=>{
    try{
        const loggedInUser = req.u;
        const connectionRequests=await ConnectionRequest.find({
            $or:[
                {toUserId:loggedInUser._id,status:"accepted"},
                {fromUserId:loggedInUser._id,status:"accepted"},
            ],
        }).populate("fromUserId",["firstName","LastName"]);
        const data = connectionRequests.map((row)=>row.fromUserId);
        res.json({data});
    }catch(err){
        res.status(400).send("ERROR"+err.message);
    }
});
userRouter.get("/feed",userAuth,async(req,res)=>{
    try{
        const loggedInUser = req.u;
        const connectionRequests = await ConnectionRequest.find({
            $or:[{fromUserId:loggedInUser._id},{toUserId:loggedInUser._id}],
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req)=>{
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });
        const u1 = await User.find({
            $and:[
                {_id:{$nin:Array.from(hideUsersFromFeed)}},
                {_id:{$ne:loggedInUser._id}},
            ],
        }).select(USER_SAFE_DATA);
        res.send(u1);
    }catch(err){
        res.status(400).send("ERROR"+err.message);
    }
});
module.exports = userRouter;