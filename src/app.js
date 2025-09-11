const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const db = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["https://dev-tinder-frontend-tan.vercel.app", "http://localhost:5173"],
  credentials: true,
}));

// Create HTTP server for socket.io
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: ["https://dev-tinder-frontend-tan.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// Store active users { userId: socketId }
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When a user logs in/registers their socket
  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // When a user sends a message
  socket.on("sendMessage", async (data) => {
    const Message = require("./models/Message");

    try {
      const newMessage = new Message(data);
      await newMessage.save();

      // find receiver's socket
      const receiverSocketId = userSocketMap[data.receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", data);
      }
    } catch (err) {
      console.error("Error saving message:", err.message);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let uid in userSocketMap) {
      if (userSocketMap[uid] === socket.id) {
        delete userSocketMap[uid];
        console.log(`User ${uid} removed from socket map`);
        break;
      }
    }
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
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
  });
