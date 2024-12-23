const express = require("express");
const multer = require("multer");

const router = express.Router();

const controller = require("../../controller/client/user.controller");
const validate = require("../../validates/client/user.validate");
const storageMulter = require("../../helper/storageMulter.js");

const upload = multer({ storage: storageMulter() });

router.get("/register", controller.register);
router.post("/register", validate.registerPost, controller.registerPost);
router.get("/login", controller.login);
router.post("/login", validate.loginPost, controller.loginPost);
router.get("/logout", controller.logout);
router.get("/password/forgot", controller.forgotPassword);
router.post(
  "/password/forgot",
  validate.forgotPasswordPost,
  controller.forgotPasswordPost
);
router.get("/password/otp", controller.otpPassword);
router.post("/password/otp", controller.otpPasswordPost);
router.get("/password/reset", controller.resetPassword);
router.post(
  "/password/reset",
  validate.resetPasswordPost,
  controller.resetPasswordPost
);
router.get("/info/:id", controller.userInfo);
router.patch("/edit", upload.single("avatar"), controller.editPatch);

router.get("/orderDetail/:index", controller.orderDetail);

module.exports = router;
