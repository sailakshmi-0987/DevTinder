const express = require("express");
const db=require("./config/database");
const app = express();
const User = require("./models/user");
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