// import model: /model/product.model.js
const Product = require("../../models/product.model");
// import helper: /helper/
const filterStatusHelper = require("../../helper/filterStatus.js");
const searchHelper = require("../../helper/search.js");
const paginationHelper = require("../../helper/pagination.js");

const systemConfig = require("../../config/system.js");

//[GET] /admin/products
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

  // Pagination
  const countProducts = await Product.countDocuments(find);

  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProducts
  );
  // End Pagination

  const products = await Product.find(find) // Thực hiện tìm kiếm trong database,trả về danh sách sản phẩm
    .sort({ position: "desc" }) // Sắp xép sản phẩm theo giá trị position giảm dần, dùng "asc" cho tăng dần
    .limit(objectPagination.limitItems) //Giới hạn số sản phẩm 1 trang
    .skip(objectPagination.skip); //Số sản phẩm bỏ qua
  res.render("admin/pages/products/index", {
    pageTitle: "Trang danh sách sản phẩm",
    titleHead: "Danh sách sản phẩm",
    products: products,
    keyword: objectSearch.keyword,
    filterStatus: filterStatus,
    pagination: objectPagination,
    isDeleted: isDeleted,
  });
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status; //params là object chứa các biến động
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status: status });

  req.flash("success", "Cập nhật trạng thái thành công");

  res.redirect(`back`);
};

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");

  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash(
        "success",
        `Cập nhật trạng thái của ${ids.length} sản phẩm thành công`
      );
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
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

        await Product.updateOne({ _id: id }, { position: position });
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
      deletedAt: new Date(),
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
  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm",
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
    const status = product.status === "active" ? true : false;
    res.render(`admin/pages/products/edit.pug`, {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      status: status,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

module.exports.editPatch = async (req, res) => {
  req.body.price = Number(req.body.price);
  req.body.discountPercentage = Number(req.body.discountPercentage);
  req.body.stock = Number(req.body.stock);
  req.body.position = Number(req.body.position);
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  } else {
    req.body.thumbnail = "";
  }
  try {
    await Product.updateOne({ _id: req.params.id }, req.body);
    req.flash("success", "Cập nhật thành công!");
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }

  res.redirect("back");
};

//[GET] /detail/:id
module.exports.detail = async (req, res) => {
  try {
    let find = {
      _id: req.params.id,
      deleted: false
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
