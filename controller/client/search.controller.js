const Product = require("../../models/product.model");

const searchHelper = require("../../helper/search.js");
const productHelper = require("../../helper/products");
// [GET] /search
module.exports.index = async (req, res) => {
  const keyword = req.query.keyword;

  let newProducts = [];
  if (keyword) {
    const find = {
      deleted: false,
      status: "active",
    };
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
      find.title = objectSearch.regex;
    }
    const products = await Product.find(find);
    newProducts = productHelper.priceNewProducts(products);
  }
  res.render("client/pages/search/index", {
    pageTitle: "Kết quả tìm kiếm",
    products: newProducts,
    keyword: keyword,
  });
};
