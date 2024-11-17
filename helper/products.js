module.exports.priceNewProducts = (products) => {
  const newProducts = products.map((item) => {
    item.priceNew = Math.round(
      (item.price * (100 - item.discountPercentage)) / 100
    );
    return item;
  });
  return newProducts;
};

module.exports.priceNewProduct = (product) => {
  const priceNew = Math.round(
    (product.price * (100 - product.discountPercentage)) / 100
  );
  return priceNew;
};
