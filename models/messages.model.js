const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    required: true
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Messages = mongoose.model("Message", messageSchema, "Messages");

module.exports = Messages;