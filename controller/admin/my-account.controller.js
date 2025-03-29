const Account = require("../../models/account.model");
const md5 = require("md5");
const systemConfig = require("../../config/system.js");
const Role = require("../../models/role.model.js");

module.exports.index = async (req, res) => {
    res.render("admin/pages/my-account/index", {
        pageTitle: "Thông tin cá nhân",
    });
};

module.exports.edit = async (req, res) => {
    res.render("admin/pages/my-account/edit", {
        pageTitle: "Chỉnh sửa thông tin cá nhân",
    });
};

module.exports.editPatch = async (req, res) => {
    const id = res.locals.user.id;

    const emailExist = await Account.findOne({
        _id: { $ne: id }, //Loại trừ email hiện tại
        email: req.body.email,
        deleted: false,
    });
    if (emailExist) {
        req.flash("error", `Email ${req.body.email} đã tồn tại, vui lòng nhập email khác`);
        res.redirect("back");
    } else {
        if (req.file) {
            req.body.avatar = `/uploads/${req.file.filename}`;
        } else {
            delete req.body.avatar;
        }
        if (req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }
        try {
            await Account.updateOne({ _id: id }, req.body);
            req.flash("success", "Cập nhật thành công!");
            res.redirect("back");
        } catch (error) {
            res.redirect(`${systemConfig.prefixAdmin}/my-account`);
        }
    }
};
