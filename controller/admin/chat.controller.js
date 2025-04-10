const User = require("../../models/account.model");
const Conversation = require("../../models/conversation.model");

//[Get] /admin/chat
module.exports.index =  async (req, res) => {

    const conversations = await Conversation.find({ admin_id: res.locals.user.id })
    .sort({ updateAt: -1 });
  
    for (let i = 0; i < conversations.length; i++) {
      const user = await User.findById(conversations[i].user_id);
      conversations[i].userName = user.fullName;
      conversations[i].userAvatar = user.avatar;
    }
    res.render("admin/pages/chat/index", {
      pageTitle: "Quản lý hội thoại",
      conversations,
    });
  };
// [GET]  /chat/:conversationId
module.exports.getChat = async (req, res) => {
  
  const conversation = await Conversation.findById(req.params.conversationId);
  const user = await User.findOne({
    _id: conversation.user_id,
  });
  const admin = await User.findOne({ 
    _id: conversation.admin_id, 
  });
  res.render(`admin/pages/chat/detail`, { 
    pageTitle: "Chi tiết hội thoại",
    conversation: conversation, 
    user: user, 
    admin: admin, 
    messages: conversation.messages
  });
};
