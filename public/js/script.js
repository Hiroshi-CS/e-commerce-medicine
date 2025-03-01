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

// Sort
const sort = document.querySelector("[sort]");
if (sort) {
  let url = new URL(window.location.href);
  const sortSelect = document.querySelector("[sort-select]");
  const sortClear = document.querySelector("[sort-clear]");

  sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;

    const [sortKey, sortValue] = value.split("-");

    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);

    window.location.href = url;
  });

  sortClear.addEventListener("click", () => {
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");

    window.location.href = url;
  });
  const sortKey = url.searchParams.get("sortKey");
  const sortValue = url.searchParams.get("sortValue");
  if(sortKey && sortValue){
    sortSelect.value = `${sortKey}-${sortValue}`;
    sortSelect.selected = true;
  }
}
// End Sort