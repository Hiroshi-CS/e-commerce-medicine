// copy all product
function copyProducts() {
  // copy from categories to all-products
  var categorie = document.querySelector('.categories');
  var allproducts = document.querySelector('.all-products');
  allproducts.innerHTML = categorie.innerHTML;

  // copy nav
  var nav_main = document.querySelector('.header-nav');
  var nav_slide = document.querySelector('.off-canvas nav');
  nav_slide.innerHTML = nav_main.innerHTML;

  //copy top header
  var topheader = document.querySelector('.header-top .wrapper');
  var topnav = document.querySelector('.off-canvas .top-nav');
  topnav.innerHTML = topheader.innerHTML;
}
copyProducts();

//slider
const swiper = new Swiper('.swiper', {
  loop: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

  
});