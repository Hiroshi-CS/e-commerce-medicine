// controllers/client/chat.controller.js
const geminiService = require('../../helper/gemini'); // Điều chỉnh đường dẫn nếu cần

// [GET] /chat (Render trang chat - Nếu bạn muốn có trang riêng)
module.exports.index = (req, res) => {
    // Có thể khởi tạo lịch sử chat trong session nếu cần
    if (!req.session.chatHistory) {
        req.session.chatHistory = [];
    }
    res.render('client/pages/chat/index', { // Đường dẫn tới file pug
        pageTitle: 'Chat với Trợ lý AI',
        chatHistory: req.session.chatHistory // Truyền lịch sử chat (nếu có) cho Pug
    });
};

// [POST] /chat/message (Xử lý tin nhắn từ client - API endpoint)
module.exports.postMessage = async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
        return res.status(400).json({ error: "Vui lòng nhập tin nhắn hợp lệ." });
    }

    // Lấy lịch sử chat từ session (nếu bạn muốn duy trì cuộc trò chuyện)
    // Giới hạn kích thước lịch sử để tránh đầy bộ nhớ/vượt context window
    const history = req.session.chatHistory || [];
    const MAX_HISTORY_LENGTH = 10; // Ví dụ: Giữ 10 cặp tin nhắn gần nhất
    const recentHistory = history.slice(-MAX_HISTORY_LENGTH);


    try {
        const geminiReply = await geminiService.sendMessage(userMessage.trim(), recentHistory);

        // Cập nhật lịch sử chat trong session
        const newHistory = [
            ...recentHistory,
            { role: "user", parts: [{ text: userMessage.trim() }] },
            { role: "model", parts: [{ text: geminiReply }] } // Lưu cả phản hồi vào lịch sử
        ];
        req.session.chatHistory = newHistory;

        // Trả về phản hồi cho client dưới dạng JSON
        res.json({ reply: geminiReply });

    } catch (error) {
        console.error("Lỗi trong Chat Controller:", error);
        res.status(500).json({ error: error.message || "Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn." });
    }
};