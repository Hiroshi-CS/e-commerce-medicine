let tree = [];

function browse(items) {
  if (items) {
    for (const item of items) { // Duyệt qua từng item trong items
      tree.push(item); // Thêm item vào danh sách tree
      if (item.children) {
        browse(item.children); // Đệ quy với các children
      }
    }
  }
}

module.exports = (items) => {
  tree = []; // Đặt lại tree thành mảng rỗng mỗi lần gọi
  browse(items);
  return tree; // Trả về danh sách đầy đủ các category và con của nó
};
