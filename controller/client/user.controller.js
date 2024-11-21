const md5 = require("md5");

const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");

const generateHelper = require("../../helper/generate");
const sendMailHelper = require("../../helper/sendMail");

//[GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register");
};
//[POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false,
  });
  if (existEmail) {
    req.flash("error", "Email đã tồn tại");
    res.redirect("back");
    return;
  }
  req.body.password = md5(req.body.password);

  const user = new User(req.body);
  await user.save();
  res.cookie("tokenUser", user.tokenUser);
  res.redirect("/");
};
//[GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login");
};
//[POST] /user/register
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    req.flash("error", "Email không tồn tại");
    res.redirect("back");
    return;
  }
  if (md5(password) != user.password) {
    req.flash("error", "Sai mật khẩu!");
    res.redirect("back");
    return;
  }
  if (user.status == "inactive") {
    req.flash("error", "Tài khoản đang bị khóa!");
    res.redirect("back");
    return;
  }

  res.cookie("tokenUser", user.tokenUser);
  res.redirect("/");
};

//[GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.redirect("/");
};

//[GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pasgeTitle: "Lấy lại mật khẩu",
  });
};

//[POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
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
    Mã OTP xác minh lấy lại mật khẩu là <b>${objectForgotPassword.otp }</b>.
    Thời hạn sử dụng là 3 phút.
    Lưu ý không để lộ mã OTP
  `
  sendMailHelper.sendMail(email,subject,html)
  res.redirect(`/user/password/otp?email=${email}`);
};

//[GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pasgeTitle: "Nhập mã OTP",
    email: email,
  });
};

//[POST] /user/password/otp
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

  const user = await User.findOne({
    email: email,
  });

  res.cookie("tokenUser", user.tokenUser);
  res.redirect("/user/password/reset");
};

//[GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password")
}

//[POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;

  await User.updateOne(
    {
      tokenUser: tokenUser
    },
    {
      password: md5(password)
    }
  )
  res.redirect("/")
}

//[GET] /user/info/:id
module.exports.userInfo = async (req, res) => {
  const id = req.params.id;

  const user = await User.findOne({
    _id: id,
    status: "active",
    deleted: false
  });
  res.render("client/pages/user/info",{
    pageTitle: "Trang cá nhân",
    user: user,
  })
}
