let count = 0;
function createTree(arr, parentId = "") {
  const tree = [];
  arr.forEach((item) => {
    if (item.parent_id === parentId) {
      const newItem = item;
      newItem.index = ++count;
      const children = createTree(arr, item._id.toString()); 
      if (children.length > 0) {
        newItem.children = children;
      }
      tree.push(newItem);
    }
  });
  return tree;
}

module.exports = (arr, parentId = "") => {
  count = 0;
  const tree = createTree(arr, parentId);
  return tree;
};