const user = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).send("Please Login!!");
        }
        const decodeObj = await jwt.verify(token,"tom@7075");
        const {_id} = decodeObj;
        const u = await user.findById(_id);
        if(!u){
            throw new Error("User not found!!");
        }
        req.u = u;
        next();
    }catch(err){
        res.status(400).send("ERROR:"+err.message);
    }
}
module.exports = {
    userAuth,
}