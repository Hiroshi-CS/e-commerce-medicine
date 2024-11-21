module.exports = (objectPagination, query, countProducts) => {
  if (query.page) objectPagination.currentPage = parseInt(query.page);
  if (!query.page) objectPagination.currentPage = 1;

  objectPagination.skip =
    (objectPagination.currentPage - 1) * objectPagination.limitItems;

  // Đếm số sản phẩm
  const totalPage = Math.ceil(countProducts / objectPagination.limitItems);
  objectPagination.totalPage = totalPage;

  return objectPagination;
};
