const Product = require("../../models/product.model"); //import modal để lấy data
const ProductCategory = require("../../models/products-category.model"); //import modal để lấy data
const filterStatusHelper = require("../../helper/filterStatus.js");
const productHelper = require("../../helper/products");
const paginationHelper = require("../../helper/pagination.js");
const createTreeHelper = require("../../helper/createTree");
const treeHelper = require("../../helper/tree");

//[GET] /products
module.exports.index = async (req, res) => {
  const countProducts = await Product.countDocuments({ deleted: false });
  let objectPagination = paginationHelper(
    { currentPage: 1, limitItems: 10 },
    req.query,
    countProducts
  );
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  const products = await Product.find({
    status: "active",
    deleted: false,
  })
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
  const newProducts = productHelper.priceNewProducts(products);
  res.render("client/pages/products/index", {
    pageTitle: "Trang danh sách sản phẩm",
    titleHead: "Danh sách sản phẩm",
    products: newProducts,
    pagination: objectPagination,
  });
};
//[GET] /products/category
module.exports.category = async (req, res) => {
  try {
    let find = {
      deleted: false,
      status: "active",
      slug: req.params.slugCategory,
    };
    
    const category = await ProductCategory.findOne(find);

    const records = await ProductCategory.find({
      deleted: false,
    });
    // List sub-category in selected category 
    const subCategory = createTreeHelper(records, category.id);
    // List product in category and subcategory
    const ids = treeHelper(subCategory);

    const countProducts = ids.length;
    let objectPagination = paginationHelper(
      { currentPage: 1, limitItems: 10 },
      req.query,
      countProducts
    );
    
    const newids = ids.map((item) => item.id);
    const products = await Product.find({
      product_category_id: { $in: [category.id, ...newids] },
      deleted: false,
    }).sort({ position: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);;

    const newProducts = productHelper.priceNewProducts(products);

    res.render(`client/pages/products/index`, {
      pageTitle: category.title,
      products: newProducts,
      pagination: objectPagination,
    });
  } catch (error) {
    res.redirect(`/products`);
  }
};

//[GET] /products/detail
module.exports.detail = async (req, res) => {
  try {
    let find = {
      deleted: false,
      status: "active",
      slug: req.params.slugProduct,
    };
    const product = await Product.findOne(find);

    if (product.product_category_id) {
      const category = await ProductCategory.findOne({
        _id: product.product_category_id,
        status: "active",
        deleted: false,
      });
      product.category = category;
    }
    product.priceNew = productHelper.priceNewProduct(product);
    res.render(`client/pages/products/detail`, {
      pageTitle: product.title,
      product: product,
    });
  } catch (error) {
    res.redirect(`/products`);
  }
};
