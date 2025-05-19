// routes/client/chat.route.js
const express = require('express');
const router = express.Router();

const controller = require('../../controller/client/chat.controller'); // Điều chỉnh đường dẫn

// Trang hiển thị giao diện chat (nếu có)
router.get('/', controller.index);

// API endpoint để client gửi tin nhắn lên
router.post('/message', controller.postMessage);

module.exports = router;