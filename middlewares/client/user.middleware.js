const User = require("../../models/account.model");

module.exports.infoUser = async (req, res, next) => {
    if (req.cookies.token) {
        const user = await User.findOne({
            token: req.cookies.token,
            deleted: false,
        }).select("-password");
        if (user){
            req.user = user;
            res.locals.user = user;
        } 
    }
    return next();
};
