const Product = require("../../models/product.model"); //import modal để lấy data

//[GET] /products
module.exports.index = async (req, res) => {
  const products = await Product.find({
    status: "active",
    deleted: false,
  }).sort({ position: "desc" });

  const newProducts = products.map((item) => {
    item.priceNew = Math.round(
      (item.price * (100 - item.discountPercentage)) / 100
    );
    return item;
  });

  res.render("client/pages/products/index", {
    pageTitle: "Trang danh sách sản phẩm",
    titleHead: "Danh sách sản phẩm",
    products: newProducts,
  });
};

//[GET] /products/detail
module.exports.detail = async (req, res) => {
  try {
    let find = {
      deleted: false,
      status: "active",
      slug: req.params.slug,
    };
    const product = await Product.findOne(find);
    const status = product.status === "active" ? true : false;
    console.log(product);
    res.render(`client/pages/products/detail`, {
      pageTitle: product.title,
      product: product,
      status: status,
    });
  } catch (error) {
    res.redirect(`/products`);
  }
};
