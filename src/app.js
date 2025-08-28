const express = require("express");
const db=require("./config/database");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require ("dotenv");
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:["https://dev-tinder-frontend-tan.vercel.app","http://localhost:5173"],
    credentials:true,
}));
app.get("/", (req, res) => {
    res.send("🚀 Backend is running successfully on Render!");
});
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);

const PORT = process.env.PORT || 3000;

db()
    .then(()=>{
        console.log("Database connection established");
        app.listen(PORT,()=>{
            console.log("server is listening at the port 3000");
        });
    })
    .catch((err)=>{
        console.error("Database cannot be connected!!");
    });