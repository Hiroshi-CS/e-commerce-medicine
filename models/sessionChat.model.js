const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    connected: {
        type: Boolean,
        default: false,
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

const SessionChat = mongoose.model("SessionChat", sessionSchema, "sessionChat");

module.exports = SessionChat;
