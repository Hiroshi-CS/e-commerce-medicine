const { max } = require("moment");
const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const conversationSchema = new mongoose.Schema({
    listUsers: {
        type: Array,
        default: [
            {
                type: String,
            },
        ],
        maxLength: 2,
        required: true,
    },
    lastMessage: String,
    updateAt: {
        type: Date,
        default: Date.now,
    },
    // messages is the array of message ids
    messages: [
        {
            type: String,
            required: true,
        },
    ],
});

const Conversations = mongoose.model("Conversation", conversationSchema, "Conversations");

module.exports = Conversations;
