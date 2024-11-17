const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/auth.controller");
const validate = require("../../validates/admin/auth.validate.js");

router.get("/login", controller.login);
router.post("/login", validate.loginPost, controller.loginPost);
router.get("/logout", controller.logout);

module.exports = router;
