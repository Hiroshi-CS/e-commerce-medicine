const Role = require("../../models/role.model")

const systemConfig = require("../../config/system.js");
//[GET] /admin/role
module.exports.index = async(req, res) => {
  let find = {
    deleted: false,
  }
  
  const records = await Role.find(find)
  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records
  });
};

//[GET] /admin/role/create
module.exports.create = async(req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Thêm nhóm quyền",
  });
};

//[GET] /admin/role/create
module.exports.createPost = async(req, res) => {
  const record = new Role(req.body);
  await record.save();

  res.redirect(`${systemConfig.prefixAdmin}/roles`);
};
