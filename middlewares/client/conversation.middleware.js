const Conversation = require("../../models/conversation.model");
const User = require("../../models/account.model");
const Role = require("../../models/role.model");

module.exports.infoChat = async (req, res, next) => {
  if (req.user) {
    const role = await Role.findOne({ title: "Quản trị viên" });

    if (req.user.role_id === role.id) return next();

    const existingConv = await Conversation.findOne({ user_id: req.user.id });

    if (existingConv) {
      res.locals.conv = existingConv;
    } else {
      const admin = await User.findOne({ role_id: role._id });
      const newConv = new Conversation({
        user_id: req.user.id,
        admin_id: admin.id,
        lastMessage: "",
        updateAt: new Date(),
        messages: [],
      });
      await newConv.save();
      res.locals.conv = newConv;
    }
  }
  next();
};
