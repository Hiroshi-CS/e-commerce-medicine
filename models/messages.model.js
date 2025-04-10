const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    senderId: String,
    senderName: String,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Messages = mongoose.model("Message", messageSchema);

module.exports = { messageSchema, Messages };
