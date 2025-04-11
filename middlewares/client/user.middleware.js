const User = require("../../models/account.model");
const Role = require("../../models/role.model");

module.exports.infoUser = async (req, res, next) => {
    if (req.cookies.token) {
        const user = await User.findOne({
            token: req.cookies.token,
            deleted: false,
        }).select("-password");
        if (user){
            const adminRoleInfo = await Role.findOne({
                title: "admin",
            })
            req.user = user;
            res.locals.user = user;
            res.locals.adminId = adminRoleInfo.id;
        } 
    }
    return next();
};
