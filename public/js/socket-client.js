const chat = document.querySelector(".chat");
const form = chat?.querySelector(".inner-form");
const input = chat?.querySelector(".chat-input");
const messages = document.getElementById("messages");

if (chat && form && input && messages) {
  const userInfo = JSON.parse(chat.getAttribute("user-info"));
  const conversationId = chat.getAttribute("conversation-id");

  let auth;
  if (userInfo && conversationId) {
    auth = {
      userId: userInfo._id,
      username: userInfo.fullName,
      conversationId: conversationId,
    };
  } else if (userInfo) {
    auth = {
      username: userInfo.fullName,
      userId: userInfo._id,
      roleUser: userInfo.role,
    };
  } else {
    auth = {
      username: "Guest user",
      roleUser: "user",
    };
  }

  const socket = io("http://localhost:3000", {
    auth: auth,
  });

  socket.on("session", (sessionID,userID,username, role, connected) => {
    socket.sessionID = sessionID,
    socket.userID = userID,
    socket.username = username,
    socket.role = role,
    socket.connected =connected
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (msg) {
      const content = {
        msg,
        createdAt: new Date(),
      };
      socket.emit("private message", content);
      input.value = "";
    }
  });

  socket.on("newMessage", (message) => {
    const li = document.createElement("li");

    const messageDiv = document.createElement("div");
    const isOutgoing = message.sender.senderId === userInfo._id;
    messageDiv.classList.add(isOutgoing ? "inner-outgoing" : "inner-incoming");

    if (!isOutgoing) {
      const nameDiv = document.createElement("div");
      nameDiv.classList.add("inner-name");
      nameDiv.textContent = message.sender.senderName;
      messageDiv.appendChild(nameDiv);
    }

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("inner-content");
    contentDiv.textContent = message.message;
    messageDiv.appendChild(contentDiv);

    const time = document.createElement("small");
    time.textContent = new Date(message.createdAt).toLocaleString("vi-VN");
    messageDiv.appendChild(time);

    li.appendChild(messageDiv);
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });

  socket.on("User disconnected", (userId) => {
    const li = document.createElement("li");
    li.classList.add("user-disconnected");
    li.textContent = `Người dùng ${userId} đã ngắt kết nối`;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });
  socket.on("User reconnected", (userName) => {
    const li = document.createElement("li");
    li.classList.add("user-reconnected");
    li.textContent = `Người dùng ${userName} đã kết nối lại`;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });
}
