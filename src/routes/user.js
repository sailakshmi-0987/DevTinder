const express = require("express");
const userRouter = express.Router();
const mongoose = require("mongoose");

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
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.u;

    const connectionRequests = await ConnectionRequest.find({
      status: "accepted",
      $or: [
        { toUserId: loggedInUser._id },
        { fromUserId: loggedInUser._id },
      ],
    })
      .populate("fromUserId", "firstName lastName photoUrl age about skills gender")
      .populate("toUserId", "firstName lastName photoUr age about skills gender");

  
    const connections = connectionRequests.map((reqObj) => {
      if (reqObj.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return reqObj.toUserId; 
      } else {
        return reqObj.fromUserId; 
      }
    });

    res.json({ data: connections });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
// routes/connection.js
userRouter.delete("/connection/remove/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    await ConnectionRequest.findOneAndDelete({
      $or: [
        { fromUserId: req.u._id, toUserId: userId, status: "accepted" },
        { fromUserId: userId, toUserId: req.u._id, status: "accepted" },
      ],
    });
    res.json({ message: "Connection removed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
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


userRouter.get("/user/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const safeFields = "firstName lastName photoUrl age gender about";
    const user = await User.findById(id).select(safeFields);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = userRouter;