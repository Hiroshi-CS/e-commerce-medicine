// Socket-client trong admin page
const chat = document.querySelector(".chat");
const form = chat?.querySelector(".inner-form");
const input = chat?.querySelector(".chat-input");
const messages = document.getElementById("messages");

if (chat && form && input && messages) {
  const userInfo = JSON.parse(chat.getAttribute("user-info"));
  const conversationId = chat.getAttribute("conversation-id");

  const socket = io({
    auth: {
      sessionID: localStorage.getItem("sessionID") || null, 
      userId: userInfo._id || null,
      username: userInfo.fullName,
      role: userInfo.role_id, 
    },
  });

  socket.on("session", (sessionData) => {
    localStorage.setItem("sessionID", sessionData.sessionID);
    if (!userInfo._id) userInfo._id = sessionData.userId;
    if (!userInfo.fullName) userInfo.fullName = sessionData.userName;
  });
  socket.on("connect", () => {
    socket.emit("joinRoom", conversationId, userInfo._id, userInfo.fullName);
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
    time.textContent = new Date(message.createdAt).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    messageDiv.appendChild(time);

    li.appendChild(messageDiv);
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });

  socket.on("User disconnected", (userName) => {
    const li = document.createElement("li");
    li.classList.add("user-disconnected");
    li.textContent = `Người dùng ${userName} đã ngắt kết nối`; // Sửa lại dùng userName thay vì userId
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