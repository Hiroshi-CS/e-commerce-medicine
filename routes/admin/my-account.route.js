const express = require("express");
const router = express.Router();
const multer = require("multer");
const storageMulter = require("../../helper/storageMulter.js");
const upload = multer({ storage: storageMulter() });

const controller = require("../../controller/admin/my-account.controller");
const validate = require("../../validates/admin/account.validate.js");

router.get("/", controller.index);
router.get("/edit", controller.edit);
router.patch(
  "/edit",
  upload.single("thumbnail"),
  validate.editPost,
  controller.editPatch
);

module.exports = router;
