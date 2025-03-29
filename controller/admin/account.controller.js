const Account = require("../../models/account.model");
const md5 = require("md5");
const systemConfig = require("../../config/system.js");
const Role = require("../../models/role.model.js");

//[GET] /admin/accounts
module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    };

    const records = await Account.find(find).select("-password -token");

    for (let item of records) {
        let id = item.role_id;
        if (!id) continue;
        const role = await Role.findOne({
            _id: id,
            deleted: false,
        });
        item.role = role.title;
    }
    res.render("admin/pages/accounts/index", {
        pageTitle: "Danh sách tài khoản",
        records: records,
    });
};

//[GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({
        deleted: false,
    });
    res.render("admin/pages/accounts/create", {
        pageTitle: "Thêm tài khoản",
        roles: roles,
    });
};
//[POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    const emailExist = await Account.findOne({
        email: req.body.email,
        deleted: false,
    });
    if (emailExist) {
        req.flash("error", `Email ${req.body.email} đã tồn tại, vui lòng nhập email khác`);
        res.redirect("back");
    } else {
        req.body.password = md5(req.body.password);
        if (req.file) {
            req.body.avatar = `/uploads/${req.file.filename}`;
        }
        const record = new Account(req.body);
        await record.save();

        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
};
//[GET] /admin/accounts/edit/id:
module.exports.edit = async (req, res) => {
    try {
        let find = {
            _id: req.params.id,
        };
        const records = await Account.findOne(find);
        const roles = await Role.find({
            deleted: false,
        });
        const status = records.status === "active" ? true : false;
        res.render(`admin/pages/accounts/edit.pug`, {
            pageTitle: "Chỉnh sửa sản phẩm",
            records: records,
            status: status,
            roles: roles,
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
};

//[PATCH] /admin/accounts/edit/id:
module.exports.editPatch = async (req, res) => {
    const emailExist = await Account.findOne({
        _id: { $ne: req.params.id }, //Loại trừ email hiện tại
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
            await Account.updateOne({ _id: req.params.id }, req.body);
            req.flash("success", "Cập nhật thành công!");
            res.redirect("back");
        } catch (error) {
            res.redirect(`${systemConfig.prefixAdmin}/accounts`);
        }
    }
};
