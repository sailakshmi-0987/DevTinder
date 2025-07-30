const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// ✅ Send Connection Request
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.u._id;
    const { toUserId, status } = req.params;

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(400).json({ message: "User not found!!" });

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: "Invalid status type!!" });

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Connection Request already exists!!" });
    }

    const connectionRequest = new ConnectionRequest({ fromUserId, toUserId, status });
    const data = await connectionRequest.save();

    res.json({ message: `${req.u.firstName} is ${status} in ${toUser.firstName}`, data });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// ✅ Review Request (Accept / Reject)
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    const allowedStatus = ["accepted", "rejected"];

    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: "Status not allowed!!" });

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: req.u._id,
      status: "interested",
    });

    if (!connectionRequest)
      return res.status(400).json({ message: "Connection request not found!!" });

    connectionRequest.status = status;
    await connectionRequest.save();

    // ✅ Add users to each other's connections if accepted
    if (status === "accepted") {
      await User.findByIdAndUpdate(connectionRequest.fromUserId, {
        $addToSet: { connections: connectionRequest.toUserId },
      });

      await User.findByIdAndUpdate(connectionRequest.toUserId, {
        $addToSet: { connections: connectionRequest.fromUserId },
      });
    }

    res.json({ message: `Connection request ${status}`, data: connectionRequest });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = requestRouter;
