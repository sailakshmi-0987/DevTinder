const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: [
      "https://dev-tinder-frontend-tan.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://dev-tinder-frontend-tan.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// ✅ Socket.IO setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const Message = require("./models/Message");
    const newMessage = new Message(data);
    await newMessage.save();

    // Emit to receiver only
    io.to(data.receiverId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routers
const chatRouter = require("./routes/chat");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/chat", chatRouter);

const PORT = process.env.PORT || 3000;

db()
  .then(() => {
    console.log("Database connection established");
    server.listen(PORT, () => { 
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
  });
