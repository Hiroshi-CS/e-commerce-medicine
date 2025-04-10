const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/chat.controller");

router.get("/", controller.index);
router.get("/:conversationId", controller.getChat)
module.exports = router;
