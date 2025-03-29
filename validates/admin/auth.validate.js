module.exports.loginPost = (req, res, next) => {
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect(req.get("Referrer") || "/");
    }
    return next();
};
