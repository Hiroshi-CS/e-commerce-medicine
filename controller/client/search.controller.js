const Product = require("../../models/product.model");

const searchHelper = require("../../helper/search.js");
const productHelper = require("../../helper/products");
const paginationHelper = require("../../helper/pagination.js");
// [GET] /search
module.exports.index = async (req, res) => {
  const keyword = req.query.keyword;

  let newProducts = [];
  if (keyword) {
    const find = {
      deleted: false,
      status: "active",
    };
    const countProducts = await Product.countDocuments({ deleted: false });
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
      find.title = objectSearch.regex;
    }

    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort.position = "desc";
    }

    let objectPagination = paginationHelper(
      { currentPage: 1, limitItems: 10 },
      req.query,
      countProducts
    );
    const products = await Product.find(find)
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);
    newProducts = productHelper.priceNewProducts(products);

    res.render("client/pages/search/index", {
      pageTitle: "Kết quả tìm kiếm",
      products: newProducts,
      keyword: keyword,
      pagination: objectPagination,
    });
  }
  res.render("client/pages/search/index", {
    pageTitle: "Kết quả tìm kiếm",
    products: newProducts,
    keyword: keyword,
  });
};
