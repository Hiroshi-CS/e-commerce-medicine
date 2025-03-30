const ProductCategory = require("../../models/products-category.model");
const createTreeHelper = require("../../helper/createTree.js");

module.exports.category = async (req, res, next) => {
  let find = {
    deleted: false,
    status: "active"
  };
  const productCategory = await ProductCategory.find(find);
  const newProductCategory = createTreeHelper(productCategory);

  res.locals.layoutProductCategory = newProductCategory; 

  return next();
};
