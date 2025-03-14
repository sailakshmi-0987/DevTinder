const express = require("express");
const app = express();
app.use('/',(req,res)=>{
    res.send("Hello people!");
})
app.listen(3000,()=>{
    console.log("server is listening at the port 3000");
});