const express = require("express");
const router = express.Router();
const multer = require("multer");
const storageMulter = require("../../helper/storageMulter.js");
const upload = multer({ storage: storageMulter() });

const controller = require("../../controller/admin/product.controller");

const validate = require("../../validates/admin/product.validate.js");

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.patch("/restore/:id", controller.restoreItem);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  validate.createPost,
  controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  validate.createPost,
  controller.editPatch
);

router.get("/detail/:id", controller.detail);

module.exports = router;
