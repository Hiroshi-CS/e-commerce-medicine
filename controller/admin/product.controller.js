// import model:
const Product = require("../../models/product.model");
const ProductCategory = require("../../models/products-category.model");
const Account = require("../../models/account.model");
// import helper: /helper/
const filterStatusHelper = require("../../helper/filterStatus.js");
const searchHelper = require("../../helper/search.js");
const paginationHelper = require("../../helper/pagination.js");
const createTreeHelper = require("../../helper/createTree.js");

const systemConfig = require("../../config/system.js");

//[GET] /admin/products
module.exports.index = async (req, res, next) => {
  try {
    // Filter
    const filterStatus = filterStatusHelper(req.query);
    // End Filter
    let find = { deleted: false };

    if (req.query.status) {
      find.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
      find.title = objectSearch.regex;
    }

    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper(
      { currentPage: 1, limitItems: 4 },
      req.query,
      countProducts
    );

    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort.position = "desc";
    }

    // Danh sách xóa
    let isDeleted = "Xóa";
    if (req.query.deleted) {
      find.deleted = true;
      isDeleted = "Khôi phục";
      const products = await Product.find(find).sort(sort);

      for (let product of products) {
        const user = await Account.findOne({
          _id: product.deletedBy.account_id,
        });
        if (user) {
          product.accountFullName = user.fullName;
        }
      }
      return res.render("admin/pages/products/deleted", {
        pageTitle: "Trang danh sách sản phẩm",
        titleHead: "Danh sách sản phẩm",
        products,
        keyword: objectSearch.keyword,
        filterStatus,
        isDeleted,
      });
    }

    const products = await Product.find(find)
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);
    
    for (let product of products) {
      // Lấy thông tin người tạo
      const user = await Account.findOne({ _id: product.createdBy.account_id });
      if (user) {
        product.accountFullName = user.fullName;
      }
    
      // Lấy thông tin người cập nhật gần nhất
      const updatedBy = product.updatedBy.splice(-1)[0];
      if(updatedBy){
        const userUpdated = await Account.findOne({_id: updatedBy.account_id})
        updatedBy.accountFullName = userUpdated.fullName;
      }
    }
    res.render("admin/pages/products/index", {
      pageTitle: "Trang danh sách sản phẩm",
      titleHead: "Danh sách sản phẩm",
      products,
      keyword: objectSearch.keyword,
      filterStatus,
      pagination: objectPagination,
      isDeleted,
    });
  } catch (err) {
    next(err); // Sử dụng `next(err)` để chuyển lỗi đến middleware xử lý lỗi
  }
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status; //params là object chứa các biến động
  const id = req.params.id;

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: Date.now(),
  };

  await Product.updateOne(
    { _id: id },
    {
      status: status,
      $push: { updatedBy: updatedBy },
    }
  );

  req.flash("success", "Cập nhật trạng thái thành công");

  res.redirect(`back`);
};

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: Date.now(),
  };

  switch (type) {
    case "active":
      await Product.updateMany(
        { _id: { $in: ids } },
        { status: "active", $push: { updatedBy: updatedBy } }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái của ${ids.length} sản phẩm thành công`
      );
      break;
    case "inactive":
      await Product.updateMany(
        { _id: { $in: ids } },
        { status: "inactive", $push: { updatedBy: updatedBy } }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái của ${ids.length} sản phẩm thành công`
      );
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          deleted: true,
          status: "deleted",
          deletedAt: new Date(),
        }
      );
      req.flash("success", `Đã xóa thành công  ${ids.length} sản phẩm`);
      break;
    case "restore-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          deleted: false,
          status: "active",
        }
      );
      req.flash("success", `Đã khôi phục thành công  ${ids.length} sản phẩm`);
      break;
    case "change-position":
      for (const item of ids) {
        const id = item.split("-")[0];
        const position = Number(item.split("-")[1]);

        await Product.updateOne(
          { _id: id },
          { position: position, $push: { updatedBy: updatedBy } }
        );
      }
      req.flash("success", `Đã đổi vị trí thành công  ${ids.length} sản phẩm`);
      break;
    default:
      break;
  }
  // await Product.updateMany({_id: {$in: ids}}, {status: type})
  res.redirect(req.get("Referrer") || "/");
};

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;

  // await Product.deleteOne({_id: id}); Xóa cứng trong database
  await Product.updateOne(
    { _id: id },
    {
      deleted: true,
      status: "deleted",
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: Date.now(),
      },
    }
  ); //Xóa mềm, ẩn trên web

  res.redirect(req.get("Referrer") || "/"); // thay thế res.redirect("back") để đảm bảo sự bảo mật
};

//[PATCH] /admin/products/restore/:id
module.exports.restoreItem = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne(
    { _id: id },
    {
      deleted: false,
      status: "active",
    }
  ); //Khôi phục lại sản phẩm

  res.redirect(req.get("Referrer") || "/");
};

//[GET] /admin/products/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };
  const records = await ProductCategory.find(find);
  const newRecords = createTreeHelper(records);

  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm",
    records: newRecords,
  });
};

//[POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  req.body.price = Number(req.body.price);
  req.body.discountPercentage = Number(req.body.discountPercentage);
  req.body.stock = Number(req.body.stock);

  if (!req.body.position) {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  req.body.createdBy = {
    account_id: res.locals.user.id,
  };

  if (req.body.categoryIds) {
    req.body.categoryIds = Array.isArray(req.body.categoryIds) 
      ? req.body.categoryIds 
      : [req.body.categoryIds]; 
  } else {
    req.body.categoryIds = []; 
  }
  
  const product = new Product(req.body);
  await product.save();

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

//[PATCH] /admin/products/edit/id:
module.exports.edit = async (req, res) => {
  try {
    let find = {
      _id: req.params.id,
    };
    const product = await Product.findOne(find);

    const records = await ProductCategory.find({ deleted: false });
    const newRecords = createTreeHelper(records);

    const status = product.status === "active" ? true : false;
    res.render(`admin/pages/products/edit.pug`, {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      status: status,
      records: newRecords,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

//[PATCH] /admin/products/edit/id:
module.exports.editPatch = async (req, res) => {
  req.body.price = Number(req.body.price);
  req.body.discountPercentage = Number(req.body.discountPercentage);
  req.body.stock = Number(req.body.stock);
  req.body.position = Number(req.body.position);
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  } else {
    delete req.body.thumbnail;
  }
  try {
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: Date.now(),
    };
    await Product.updateOne(
      { _id: req.params.id },
      {
        ...req.body,
        $push: { updatedBy: updatedBy },
      }
    );
    req.flash("success", "Cập nhật thành công!");
    res.redirect("back");
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

//[GET] /detail/:id
module.exports.detail = async (req, res) => {
  try {
    let find = {
      _id: req.params.id,
      deleted: false,
    };
    const product = await Product.findOne(find);
    const status = product.status === "active" ? true : false;

    res.render(`admin/pages/products/detail`, {
      pageTitle: `Chi tiết sản phẩm ${product.title}`,
      product: product,
      status: status,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
