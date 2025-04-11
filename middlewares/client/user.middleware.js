const User = require("../../models/account.model");
const Role = require("../../models/role.model");

module.exports.infoUser = async (req, res, next) => {
    if (req.cookies.token) {
        const user = await User.findOne({
            token: req.cookies.token,
            deleted: false,
        }).select("-password");
        if (user){
            const role = await Role.findOne({
                title: "admin"
            })
            res.locals.adminRole = role.id;
            req.user = user;
            res.locals.user = user;
        } 
    }
    return next();
};
