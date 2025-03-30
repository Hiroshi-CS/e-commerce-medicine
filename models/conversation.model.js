const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);



const conversationSchema = new mongoose.Schema({
    user_id: String,
    admin_id: String,
    lastMessage: String,
    updateAt: {
      type: Date,
      default: Date.now,
    },
    messages: [messageSchema],
});

const Conversations = mongoose.model("Conversation", conversationSchema, "Conversations");

module.exports = Conversations;
