// socket-server.io
const { Server } = require("socket.io");
const Conversation = require("../models/conversation.model");
const User = require("../models/account.model");
const Role = require("../models/role.model");
const sessionChatModel = require("../models/sessionChat.model");
const generate = require("../helper/generate");
const session = require("express-session");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  io.use(async (socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
      const session = await sessionChatModel.findOne({ sessionId: sessionID });
      if (session) {
        socket.sessionID = sessionID;
        socket.userId = session.userId;
        socket.userName = session.username;
        socket.role = session.role;
        socket.connected = true;

        // Cập nhật session
        session.connected = true;
        session.updatedAt = Date.now();
        await session.save();
        return next();
      }
    }

    const userName = socket.handshake.auth.username;
    if (!userName) {
      return next(new Error("invalid username"));
    }

    socket.sessionID = generate.generateRandomString(20);
    socket.userId = socket.handshake.auth.userId || `guest_${socket.sessionID}`;
    socket.userName = userName;
    if (socket.handshake.auth.role) {
      const adminRole = await Role.findById(socket.handshake.auth.role);
      socket.role = adminRole.title;
    } else {
      socket.role = "user";
    }
    socket.connected = true;

    // Lưu session vào database
    const newSession = new sessionChatModel({
      sessionId: socket.sessionID,
      userId: socket.userId,
      username: socket.userName,
      role: socket.role,
      connected: true,
    });
    await newSession.save();

    return next();
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId);

    socket.emit("session", {
      sessionID: socket.sessionID,
      userId: socket.userId,
      userName: socket.userName,
      role: socket.role,
      connected: socket.connected,
    });

    // Join room private (admin page)
    socket.on("joinRoom", async (conversationId) => {
      socket.join(conversationId);
      socket.conversationId = conversationId;
      socket.userId = socket.userId;
      socket.userName = socket.userName;
    });

    // Get messages history (client - page)
    socket.on("getMessages", async (userId) => {
      const roleAdmin = await Role.findOne({
        title: "admin",
      });

      const adminId = await User.findOne({
        role_id: roleAdmin.id,
      });
      // Tim kiem cuoc hoi thoai theo userId da luu trong socket
      let conversation = await Conversation.findOne({
        user_id: socket.userId,
      });
      //Nếu chưa có hội thoại
      if (!conversation) {
        conversation = new Conversation({
          user_id: socket.userId,
          admin_id: adminId.id,
          lastMessage: "",
          updateAt: new Date(),
          messages: [],
        });
        await conversation.save();
      }
      (socket.conversationId = conversation.id),
        // Join room private
        socket.join(conversation.id);
      // Load old message
      socket.emit("loadMessages", conversation.messages);
    });

    // Handle private message
    socket.on("private message", async (message) => {
      const content = message.msg;
      const createdAt = message.createdAt;

      const conversation = await Conversation.findOne({
        _id: socket.conversationId,
      });
      const newMessage = {
        sender: {
          senderId: socket.userId,
          senderName: socket.userName,
        },
        message: content,
        createdAt,
      };
      conversation.messages.push(newMessage);
      conversation.lastMessage = content;
      conversation.updateAt = new Date();
      await conversation.save();
      io.to(conversation.id).emit("newMessage", newMessage);
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      const matchingSockets = await io.in(socket.userId).fetchSockets();
      const isStillConnected = matchingSockets.length == 0;
      if (isStillConnected) {
        // Check if user is role admin
        /*
                1. admin when disconnect will send notification to all user
                2. user when disconnect will send notification to admin
            */
        if (socket.role == "admin") {
          socket.broadcast.emit("Admin disconnected", socket.userName); // notify for another people
        } else {
          socket.broadcast
            .to(socket.conversationId)
            .emit("User disconnected", socket.userName); // notify for admin
        }

        const session = await sessionChatModel.findOne({
          sessionId: socket.sessionID,
        });
        if (session) {
          session.connected = false;
          session.updatedAt = Date.now();
          await session.save();
        }
      }
    });
  });

  return io;
}

module.exports = initSocketServer;
