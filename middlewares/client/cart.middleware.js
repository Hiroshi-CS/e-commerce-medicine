const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const productHelper = require("../../helper/products");

module.exports.cartId = async (req, res, next) => {
  if (!req.cookies.cartId) {
    const cart = new Cart();
    await cart.save();

    const expiresTime = 1000 * 60 * 60 * 24 * 365;
    res.cookie("cartId", cart.id, {
      expires: new Date(Date.now() + expiresTime),
    });
  } else {
    const cart = await Cart.findOne({
      _id: req.cookies.cartId,
    });
    cart.totalQuantity = cart.products.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totalPrice = 0;
    if (cart.products.length > 0) {
      for (item of cart.products) {
        const product = await Product.findOne({
          _id: item.product_id,
        });
        if (product) {
          cart.totalPrice += productHelper.priceNewProduct(product)*item.quantity;
        }
      }
    }
    res.locals.miniCart = cart;
  }
  return next();
};
