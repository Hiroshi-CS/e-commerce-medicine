const Account = require("../../models/account.model");

const md5 = require("md5");
const Role = require("../../models/role.model.js");

const ForgotPassword = require("../../models/forgot-password.model");

const generateHelper = require("../../helper/generate");
const sendMailHelper = require("../../helper/sendMail");
const Product = require("../../models/product.model");

//[GET] /account/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register");
};
//[POST] /account/register
module.exports.registerPost = async (req, res) => {
    const existEmail = await Account.findOne({
        email: req.body.email,
        deleted: false,
    });
    if (existEmail) {
        req.flash("error", "Email đã tồn tại");
        res.redirect("back");
        return;
    }
    req.body.password = md5(req.body.password);
    const role = await Role.findOne({
        title: "Khách hàng",
        deleted: false,
    });
    req.body.role_id = role._id;

    const account = new Account(req.body);
    await account.save();
    res.cookie("token", account.token);
    res.redirect("/");
};
//[GET] /account/login
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login");
};
//[POST] /account/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const account = await Account.findOne({
        email: req.body.email,
    });
    if (!account) {
        req.flash("error", "Email không tồn tại");
        res.redirect("back");
        return;
    }
    if (md5(password) != account.password) {
        req.flash("error", "Sai mật khẩu!");
        res.redirect("back");
        return;
    }
    if (account.status == "inactive") {
        req.flash("error", "Tài khoản đang bị khóa!");
        res.redirect("back");
        return;
    }

    res.cookie("token", account.token);
    res.redirect("/");
};

//[GET] /account/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
};

//[GET] /account/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pasgeTitle: "Lấy lại mật khẩu",
    });
};

//[POST] /account/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;
    const account = await Account.findOne({
        email: email,
        deleted: false,
    });
    if (!account) {
        req.flash("error", "Email không tồn tại");
        res.redirect("back");
        return;
    }
    // Việc 1: Tạo mã OTP và lưu OTP, email vào colletion forgot-password
    const objectForgotPassword = {
        email: email,
        otp: "",
        expireAt: new Date(Date.now() + 3 * 60 * 1000),
    };
    objectForgotPassword.otp = generateHelper.genarateRandomNumber(6);

    const forgotPassword = new ForgotPassword(objectForgotPassword);

    await forgotPassword.save();
    // Việc 2: Gửi mã OTP qua email
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
    Mã OTP xác minh lấy lại mật khẩu là <b>${objectForgotPassword.otp}</b>.
    Thời hạn sử dụng là 3 phút.
    Lưu ý không để lộ mã OTP
  `;
    sendMailHelper.sendMail(email, subject, html);
    res.redirect(`/user/password/otp?email=${email}`);
};

//[GET] /account/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;

    res.render("client/pages/user/otp-password", {
        pasgeTitle: "Nhập mã OTP",
        email: email,
    });
};

//[POST] /account/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    console.log({
        email: email,
        otp: otp,
    });

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp,
    });

    if (!result) {
        req.flash("error", "OTP không hợp lệ");
        res.redirect("back");
        return;
    }

    const account = await Account.findOne({
        email: email,
    });

    res.cookie("token", account.token);
    res.redirect("/user/password/reset");
};

//[GET] /account/password/reset
module.exports.resetPassword = async (req, res) => {
    res.render("client/pages/user/reset-password");
};

//[POST] /account/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password;
    const token = req.cookies.token;

    await Account.updateOne(
        {
            token: token,
        },
        {
            password: md5(password),
        }
    );
    res.redirect("/");
};

//[GET] /account/info/:id
module.exports.userInfo = async (req, res) => {
    const id = req.params.id;

    const account = await Account.findOne({
        _id: id,
        status: "active",
        deleted: false,
    });
    let orders = [];
    for (order of account.orders) {
        let products = [];
        for (product of order.products) {
            let productInfo = await Product.findOne({
                _id: product.product_id,
            })
                .select("title thumbnail price discountPercentage")
                .lean();
            productInfo.quantity = product.quantity;
            products.push(productInfo);
        }
        orders.push(products);
    }
    res.render("client/pages/user/info", {
        pageTitle: "Trang cá nhân",
        account: account,
        orders: orders,
    });
};

module.exports.orderDetail = (req, res) => {
    const index = req.params.index;
    req.flash("index", index);
    res.redirect("back");
};
module.exports.editPatch = async (req, res) => {
    const accountToken = req.cookies.token;
    if (req.file) {
        req.body.avatar = `/uploads/${req.file.filename}`;
    } else {
        delete req.body.avatar;
    }
    try {
        await Account.updateOne({ token: accountToken }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    } catch (error) {
        console.log(error);
        res.redirect(`/`);
    }
};
