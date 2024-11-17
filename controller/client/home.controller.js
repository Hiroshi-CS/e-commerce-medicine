const Product = require("../../models/product.model");
const productHelper = require("../../helper/products");

//[GET] /
module.exports.index = async (req, res) => {
  const productsFeatured = await Product.find({
    featured: "1",
    deleted: false,
    status: "active",
  });
  
  const newProductsFeatured = productHelper.priceNewProducts(productsFeatured);

  const productsNew = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort({ position: "desc" })
    .limit(6);
  const newProductsNew = productHelper.priceNewProducts(productsNew);
  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productsFeatured: newProductsFeatured,
    productsNew: newProductsNew
  });
};
