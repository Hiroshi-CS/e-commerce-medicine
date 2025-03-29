module.exports.createPost = (req, res, next) => {
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

module.exports.editPost = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập tên!");
        return res.redirect(req.get("Referrer") || "/");
    }
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email!");
        return res.redirect(req.get("Referrer") || "/");
    }
    return next();
};
