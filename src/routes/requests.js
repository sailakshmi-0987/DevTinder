const express = require('express');
const requestRouter = express.Router();
const {userAuth} = require("../middleware/auth");
const user =  require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post("/request/send/:status/:toUserId",userAuth,async (req,res)=>{
    try{
        const fromUserId = req.u._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const toUser = await user.findById(toUserId);
        if(!toUser){
            return res.status(400).json({
                message:"User not found!!"
            });
        }

        const allowedStatus = ["ignored","interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message:"Invalid status type!!"});
        }
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId,toUserId},
                {
                    fromUserId:toUserId,toUserId:fromUserId
                },
            ],
        });
        if(existingConnectionRequest){
            return res.status(400).send({message:"Connection Request already exists!!"});
        }
        const connectionRequest =  new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });
        
        const data = await connectionRequest.save();

        res.json({
            message:req.u.firstName + "is" + status + "in" + toUser.firstName,
            data,
        });
    }catch(err){
        res.status(400).send("Error:"+err.message);
    }
    //res.send(u.firstName + "sent the connect request!");
});
requestRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async(req,res)=>{
        try{
            const loggedInUser = req.u;
            const {status,requestId}=req.params;

            const allowedStatus = ["accepted","rejected"];
            if(!allowedStatus.includes(status)){
                return res.status(400).json({message:"Status not allowed!!"});
            }
            const connectionRequest = await ConnectionRequest.findOne({
                _id:requestId,
                toUserId:loggedInUser._id,
                status:"interested",
            })
            if(!connectionRequest){
                return res.status(400).json({message:"Connection request not found!!"});
            }
            connectionRequest.status = status;
            const data = await connectionRequest.save();

            res.json({message : "Connection request "+status,data});
        }catch(err){
            res.status(400).send("Error : "+err.message);
            
        }
    }
)
module.exports = requestRouter;