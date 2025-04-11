// sidebar-chat.js
document.addEventListener("DOMContentLoaded", () => {
  const openChatBtn = document.getElementById("openChatBtn");
  const closeChatBtn = document.getElementById("closeChatBtn");
  const chatPanel = document.getElementById("chat");
  const messageInput = document.getElementById("messageInput");
  const messagesList = document.getElementById("messages");
  const chatElement = chatPanel.querySelector(".chat");

  const user = JSON.parse(chatElement.getAttribute("user-info"));
  openChatBtn.addEventListener("click", () => {
    chatPanel.style.display = "block"; 
    initializeSocketIO();
  });

  closeChatBtn.addEventListener("click", () => {
    chatPanel.style.display = "none"; 
  });

  let socket;
  function initializeSocketIO() {
    if (socket && socket.connected) return; 

    socket = io({
      auth: {
        sessionID: localStorage.getItem("sessionID") || null, 
        userId: user._id || null,
        username: user.fullName || "Guest",
        role: user.role_id || null, 
      },
    });
    
    socket.on("session", (sessionData) => {
      localStorage.setItem("sessionID", sessionData.sessionID); 
      if (!user._id) user._id = sessionData.userId;
      if (!user.fullName) user.fullName = sessionData.userName;
    });

    //Connect
    socket.on("connect", () => {
      if(user)
        socket.emit("getMessages", user._id); //Get message history
    }); 

    //load message history
    socket.on("loadMessages", (messages) => {
      messagesList.innerHTML = ""; 
      messages.forEach((msg) => {
        const li = document.createElement("li");
        const messageDiv = document.createElement("div");
        const isOutgoing = msg.sender.senderId === user._id;
        messageDiv.classList.add(isOutgoing ? "inner-outgoing" : "inner-incoming");
    
        if (!isOutgoing) {
          const nameDiv = document.createElement("div");
          nameDiv.classList.add("inner-name");
          nameDiv.textContent = msg.sender.senderName;
          messageDiv.appendChild(nameDiv);
        }
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("inner-content");
        contentDiv.textContent = msg.message;
        messageDiv.appendChild(contentDiv);
        const time = document.createElement("small");
        time.textContent = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        messageDiv.appendChild(time);
        li.appendChild(messageDiv);
        messagesList.appendChild(li);
      });
      messagesList.scrollTop = messagesList.scrollHeight;
    });

    // Listen newMessage event and disolay on panel
    socket.on("newMessage", (msg) => {
      const li = document.createElement("li");

      const messageDiv = document.createElement("div");
      const isOutgoing = msg.sender.senderId === user._id;
      messageDiv.classList.add(isOutgoing ? "inner-outgoing" : "inner-incoming");

      if (!isOutgoing) {
        const nameDiv = document.createElement("div");
        nameDiv.classList.add("inner-name");
        nameDiv.textContent = msg.sender.senderName;
        messageDiv.appendChild(nameDiv);
      }
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("inner-content");
      contentDiv.textContent = msg.message;
      messageDiv.appendChild(contentDiv);
      const time = document.createElement("small");
      time.textContent = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      messageDiv.appendChild(time);
      li.appendChild(messageDiv);
      messagesList.appendChild(li);
      messagesList.scrollTop = messagesList.scrollHeight;
    });

    socket.on("User disconnected", (userName) => {
      const li = document.createElement("li");
      li.classList.add("user-disconnected");
      li.textContent = `Người dùng ${userName} đã ngắt kết nối`;
      messagesList.appendChild(li);
      messagesList.scrollTop = messagesList.scrollHeight;
    });

    socket.on("Admin disconnected", (userName) => {
      const li = document.createElement("li");
      li.classList.add("user-disconnected");
      li.textContent = `Quản trị viên ${userName} đã ngắt kết nối`;
      messagesList.appendChild(li);
      messagesList.scrollTop = messagesList.scrollHeight;
    });

    // Listen input value and send to server
    const form = chatPanel.querySelector(".inner-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault(); 
      const content = messageInput.value.trim();
      if (content) {
        socket.emit("private message", {
          msg: content,
          createdAt: new Date(),
        });
        messageInput.value = ""; 
      }
    });
  }
});