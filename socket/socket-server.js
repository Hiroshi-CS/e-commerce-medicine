// socket-server.io
const { Server } = require("socket.io");
const Conversation = require("../models/conversation.model");
const sessionChatModel = require("../models/sessionChat.model"); 
const generate = require("../helper/generate"); 

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
    socket.role = socket.handshake.auth.role || "user"; 
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
    socket.emit("session", {
      sessionID: socket.sessionID,
      userId: socket.userId,
      userName: socket.userName,
      role: socket.role,
      connected: socket.connected,
    });

    // Join room private
    socket.on("joinRoom", async (conversationId, userId, userName) => {
      socket.join(conversationId);
      socket.conversationId = conversationId;
      socket.userId = userId || socket.userId; 
      socket.userName = userName || socket.userName; 
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
      conversation.updatedAt = new Date();
      await conversation.save();

      io.to(socket.conversationId).emit("newMessage", newMessage);
    });

    // Handle disconnect 
    socket.on("disconnect", async () => {
      const matchingSockets = await io.in(socket.conversationId).fetchSockets();
      const isStillConnected = matchingSockets.length > 0;

      if (!isStillConnected) {
        socket.broadcast
          .to(socket.conversationId)
          .emit("User disconnected", socket.userName);

        const session = await sessionChatModel.findOne({ sessionId: socket.sessionID });
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