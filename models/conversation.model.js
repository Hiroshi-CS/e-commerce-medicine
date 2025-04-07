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

    lastMessage: {
        type: String,
        default: "",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    updateAt: {
        type: Date,
        default: Date.now,
    },
});

const Conversations = mongoose.model("Conversation", conversationSchema, "Conversations");

module.exports = Conversations;
