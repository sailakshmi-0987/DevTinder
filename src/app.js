const express = require("express");
const db=require("./config/database");
const app = express();
const User = require("./models/user");
const user = require("./models/user");
app.use(express.json());

app.post('/signup',async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        res.send("user added succesfully");
    }catch (err) {
        res.status(400).send("Error adding the user:" + err.message);
    }
});
app.get('/users',async(req,res)=>{
    const userEmail = req.body.email; 
    try{
        const u=await user.findOne({email:userEmail});
        if(!u){
            res.status(404).send("User not found");
        }else{
            res.send(u);
        }
    }catch(err){
        res.status(408).send("Something went wrong");
    }
    
});
app.get('/feed',async(req,res)=>{
    try{
        const users = await user.find({});
        res.send(users);
    }catch(err){
        res.status(400).send("something went wrong");
    }
});
app.delete('/users',async(req,res)=>{
    const userId = req.body.userId; 
    try{
        const u = await user.findByIdAndDelete(userId);
        res.send("User deleted successfully");
       
    }catch(err){
        res.status(408).send("Something went wrong");
    }
    
});
app.patch('/users/:userId',async(req,res)=>{
    const userId = req.params?.userId;
    const data = req.body;
    
    try{
        const ALLOWED_UPDATES=["photourl","bout","gender","age","skills"];
        const isUpdateAllowed=Object.keys(data).every(
            (k)=>ALLOWED_UPDATES.includes(k)
        );
        if(!isUpdateAllowed){
            throw new Error("Cannot be updated..");
        }
        if(data?.skills.length>10){
            throw new Error("Skills cannot be more than 10."); 
        }
        const u=await user.findByIdAndUpdate({ _id:userId},data,{
            returnDocument:"after",
            runValidators:true,
        });
        res.send("Data updated successfully");
    }catch(err){
        res.status(400).send("something went wrong:"+err.message);
    }
});
db()
    .then(()=>{
        console.log("Database connection established");
        app.listen(3000,()=>{
            console.log("server is listening at the port 3000");
        });
    })
    .catch((err)=>{
        console.error("Database cannot be connected!!");
    });