module.exports.registerPost = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập tên!");
        return res.redirect(req.get("Referrer") || "/");
    }
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect(req.get("Referrer") || "/");
    }
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập password!");
        return res.redirect(req.get("Referrer") || "/");
    }
    return next();
};

module.exports.loginPost = (req, res, next) => {
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect(req.get("Referrer") || "/");
    }
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập password!");
        return res.redirect(req.get("Referrer") || "/");
    }
    return next();
};

module.exports.forgotPasswordPost = (req, res, next) => {
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect(req.get("Referrer") || "/");
    }
    return next();
};

module.exports.resetPasswordPost = (req, res, next) => {
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập mật khẩu!");
        return res.redirect(req.get("Referrer") || "/");
    }
    if (!req.body.confirmPassword) {
        req.flash("error", "Vui lòng xác nhận lại mật khẩu!");
        return res.redirect(req.get("Referrer") || "/");
    }
    if (req.body.password != req.body.confirmPassword) {
        req.flash("error", "Xác nhận mật khẩu không trùng khớp!");
        return res.redirect(req.get("Referrer") || "/");
    }
    return next();
};
