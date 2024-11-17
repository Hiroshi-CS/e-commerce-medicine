const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const productHelper = require("../../helper/products");
//[GET] /cart
module.exports.index = async (req,res) =>{
  const cartId = req.cookies.cartId;
  const cart = await Cart.findOne({
    _id: cartId,
  })
  let newProducts = [];
  if(cart.products.length > 0){
    let products = []
    for(const item of cart.products){
      const product = await Product.findOne({
        _id: item.product_id
      })
      product.quantity = item.quantity
      products.push(product)
    }
    newProducts = productHelper.priceNewProducts(products);
  }
  res.render("client/pages/cart/index",{
    pageTitle: "Giỏ hàng",
    products: newProducts,
  })
}


//[POST] /cart/add/:id
module.exports.addPost = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = Number(req.body.quantity);

  const cart = await Cart.findOne({
    _id: cartId,
  });
  const existProductInCart = cart.products.find(
    item => item.product_id == productId
  );
  if (existProductInCart) {
    const newQuantity = existProductInCart.quantity + quantity;
    await Cart.updateOne(
      {
        _id: cartId,
        "products.product_id": productId,
      },
      {
        "products.$.quantity": newQuantity,
      }
    );
    req.flash("success","Cập nhật số lượng sản phẩm trong giỏ hàng thành công!")
  } else {
    const objectCart = {
      product_id: productId,
      quantity: quantity,
    };
    await Cart.updateOne(
      {
        _id: cartId,
      },
      {
        $push: { products: objectCart },
      }
    );
    req.flash("success", "Thêm sản phảm vào giỏ hàng thành công");
  }
  res.redirect("back");
};

//[GET] /cart/update/:productId/:quantity
module.exports.update = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = req.params.quantity;

  await Cart.updateOne(
    {
      _id: cartId,
      "products.product_id": productId,
    },
    {
      "products.$.quantity": quantity,
    }
  );
  req.flash("success","Cập nhật số lượng thành công!")
  res.redirect("back")
}
//[GET] /cart/delete/:id
module.exports.delete = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  await Cart.updateOne(
    {
      _id: cartId,
    },
    {
      "$pull": { products: {"product_id": productId}}
    }
  )
  req.flash("Đã xóa sản phẩm khỏi giỏ hàng!");
  res.redirect("back");
}