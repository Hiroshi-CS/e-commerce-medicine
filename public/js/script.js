// Show Alert
const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
  const time = showAlert.getAttribute("data-time");
  parseInt(time);

  const closeAlert = showAlert.querySelector("[close-alert]");

  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);

  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  });
}
// End Show Alert

// Button Go Back
const buttonsGoBack = document.querySelectorAll("[button-go-back]")
if(buttonsGoBack.length > 0){
  buttonsGoBack.forEach(button => {
    button.addEventListener("click", () =>{
      history.back();
    })
  })
}
// End Button Go Back

// Pagination
const buttonPagination = document.querySelectorAll("[button-pagination]");
if (buttonPagination) {
  let url = new URL(window.location.href);
  buttonPagination.forEach((page) => {
    page.addEventListener("click", () => {
      const Page = page.getAttribute("button-pagination");
      if (Page) {
        url.searchParams.set("page", Page); // Thay đổi page trên thanh url = page( button )
      } else url.searchParams.delete("page");
      window.location.href = url; //Trả về url mới thỏa điều kiện button
    });
  });
}
// End Pagination