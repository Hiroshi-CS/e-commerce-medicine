const ProductCategory = require("../../models/products-category.model");

const filterStatusHelper = require("../../helper/filterStatus.js");
const searchHelper = require("../../helper/search.js");
const paginationHelper = require("../../helper/pagination.js");
const createTreeHelper = require("../../helper/createTree.js");

const systemConfig = require("../../config/system.js");

//[GET] /admin/products-category/
module.exports.index = async (req, res) => {
  // Filter
  const filterStatus = filterStatusHelper(req.query);
  // End Filter

  let find = {
    // Tạo biến find để tìm kiếm trong database
    deleted: false, // Lọc ra các sản phẩm chưa bị xóa
  };

  // Check recycle bin
  let isDeleted = "Xóa";
  if (req.query.deleted) {
    find.deleted = true;
    isDeleted = "Khôi phục";
  }
  //End check recycle bin
  // Get status (active/inactive)
  if (req.query.status) {
    find.status = req.query.status;
  }
  // End get status

  //--------------

  // Search
  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  // End Search

  // -------------

  let sort = {};

  // Sort
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "asc";
  }
  // End Sort

  const records = await ProductCategory.find(find).sort(sort);
  const newRecords = createTreeHelper(records);

  res.render("admin/pages/products-category/index", {
    pageTitle: "Trang danh mục sản phẩm",
    records: newRecords,
    keyword: objectSearch.keyword,
    filterStatus: filterStatus,
    isDeleted: isDeleted,
  });
};

//[GET] /admin/products-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find);

  const newRecords = createTreeHelper(records);

  newRecords.forEach((item) => console.log(item.children));
  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục",
    records: newRecords,
  });
};

//[POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
  if (!req.body.position) {
    const countProducts = await ProductCategory.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  if (req.body["parent-id"]) {
    req.body.parent_id = req.body["parent-id"];
  }

  const record = new ProductCategory(req.body);
  await record.save();

  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};

//[PATCH] /admin/products-category/edit/id:
module.exports.edit = async (req, res) => {
  try {
    let find = {
      _id: req.params.id,
    };
    const product = await ProductCategory.findOne(find);
    const status = product.status === "active" ? true : false;

    const records = await ProductCategory.find({ deleted: false });
    const newRecords = createTreeHelper(records);

    res.render(`admin/pages/products-category/edit.pug`, {
      pageTitle: "Chỉnh sửa sản phẩm",
      records: newRecords,
      product: product,
      status: status,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};

// //[PATCH] /admin/products-category/edit/id:?_method=PATCH
module.exports.editPatch = async (req, res) => {
  req.body.position = Number(req.body.position);
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  } else {
    req.body.thumbnail = "";
  }
  try {
    await ProductCategory.updateOne({ _id: req.params.id }, req.body);
    req.flash("success", "Cập nhật thành công!");
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }

  res.redirect("back");
};
