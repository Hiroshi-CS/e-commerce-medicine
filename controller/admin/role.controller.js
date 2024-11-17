const Role = require("../../models/role.model");

const systemConfig = require("../../config/system.js");
//[GET] /admin/role
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await Role.find(find);
  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records,
  });
};

//[GET] /admin/role/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Thêm nhóm quyền",
  });
};

//[GET] /admin/role/create
module.exports.createPost = async (req, res) => {
  const record = new Role(req.body);
  await record.save();

  res.redirect(`${systemConfig.prefixAdmin}/roles`);
};

//[GET] /admin/role/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
      deleted: false,
    };

    const data = await Role.findOne(find);

    res.render(`admin/pages/roles/edit`, {
      pageTitle: "Chỉnh sửa nhóm quyền",
      data: data,
    });
  } catch {
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

//[PATCH] /admin/role/edit/:id?_method=PATCH
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, req.body);
    req.flash("success", "Cập nhật nhóm quyền thành công!");
  } catch {
    req.flash("error", "Cập nhật thất bại");
  }
  res.redirect("back");
};

//[GET] /admin/role/permissions
module.exports.permissions = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await Role.find(find);
  res.render("admin/pages/roles/permissions", {
    pageTitle: "Phân quyền",
    records: records,
  });
};

//[PATCH] /admin/role/permissions?_method=PATCH
module.exports.permissionsPatch = async(req,res) =>{
  const permissions = JSON.parse(req.body.permissions);
  for(item of permissions){
    await Role.updateOne({_id: item.id},{permissions: item.permissions});
  }
  req.flash("success", "Cập nhật phân quyền thành công!")
  res.redirect("back")
}