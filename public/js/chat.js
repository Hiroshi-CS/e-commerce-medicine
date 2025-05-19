// public/js/gemini-chat-panel.js (Script RIÊNG cho panel Gemini)

document.addEventListener("DOMContentLoaded", () => {
  // --- Lấy các phần tử DOM của panel GEMINI ---
  const openChatBtn = document.getElementById("openGeminiChatBtn"); // *** ID Nút Gemini ***
  const closeChatBtn = document.getElementById("closeGeminiChatBtn"); // *** ID Nút đóng Gemini ***
  const chatPanel = document.getElementById("gemini-chat"); // *** ID Panel Gemini ***
  const messageInput = document.getElementById("gemini-messageInput"); // *** ID Input Gemini ***
  const messagesList = document.getElementById("gemini-messages"); // *** ID List tin nhắn Gemini ***
  const chatBody = chatPanel.querySelector(".inner-body"); // Body của panel Gemini
  const chatForm = document.getElementById("gemini-chat-form"); // *** ID Form Gemini ***
  const submitButton = chatForm.querySelector("button[type='submit']");
  // const spinner = submitButton.querySelector('.spinner-border');

  // --- URL API Backend Gemini ---
  const geminiApiUrl = '/chat/message';

  // --- Xử lý Mở/Đóng Panel GEMINI ---
  openChatBtn.addEventListener("click", () => {
      // Cân nhắc: Đóng panel kia nếu đang mở?
      // const socketPanel = document.getElementById("chat");
      // if (socketPanel) socketPanel.style.display = 'none';

      chatPanel.style.display = "block";
      if (messagesList.children.length === 0) {
          displayMessage(
              "Trợ lý AI",
              "Chào bạn! Tôi có thể giúp gì về sản phẩm hoặc thông tin chung của nhà thuốc? (Lưu ý: Tôi không thể đưa ra lời khuyên y tế).",
              false
          );
      }
      messageInput.focus();
  });

  closeChatBtn.addEventListener("click", () => {
      chatPanel.style.display = "none";
  });

  // --- Hàm Hiển thị Tin nhắn (Giống bước trước, dùng cho list #gemini-messages) ---
  function displayMessage(senderName, messageContent, isUserMessage) {
      const li = document.createElement("li");
      const messageDiv = document.createElement("div");
      messageDiv.classList.add(isUserMessage ? "inner-outgoing" : "inner-incoming");

      if (!isUserMessage) {
          const nameDiv = document.createElement("div");
          nameDiv.classList.add("inner-name");
          nameDiv.textContent = senderName;
          messageDiv.appendChild(nameDiv);
      }

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("inner-content");
      contentDiv.innerHTML = messageContent.replace(/\n/g, '<br>');
      messageDiv.appendChild(contentDiv);

      const time = document.createElement("small");
      time.textContent = new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
      });
      messageDiv.appendChild(time);

      li.appendChild(messageDiv);
      messagesList.appendChild(li); // *** Thêm vào list của Gemini ***
      chatBody.scrollTop = chatBody.scrollHeight;
  }

  // --- Xử lý Gửi Tin nhắn (Gọi API Gemini, giống bước trước) ---
  chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userMessage = messageInput.value.trim();

      if (!userMessage) return;

      displayMessage("Bạn", userMessage, true);
      const currentMessageValue = userMessage;
      messageInput.value = "";

      messageInput.disabled = true;
      submitButton.disabled = true;
      // if (spinner) spinner.classList.remove('d-none');

      try {
          const response = await fetch(geminiApiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: currentMessageValue }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `Lỗi ${response.status}`);
          if (data.reply) displayMessage("Trợ lý AI", data.reply, false);
          else displayMessage("Trợ lý AI", "(Không có phản hồi)", false);
      } catch (error) {
          console.error("Lỗi khi gọi Gemini API:", error);
          displayMessage("Lỗi Hệ thống", `Không thể nhận phản hồi. ${error.message}`, false);
      } finally {
          messageInput.disabled = false;
          submitButton.disabled = false;
          // if (spinner) spinner.classList.add('d-none');
          messageInput.focus();
      }
  });

}); // Kết thúc DOMContentLoaded