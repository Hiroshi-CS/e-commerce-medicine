// Button Status
const buttonStatus = document.querySelectorAll("[button-status]");
if (buttonStatus.length > 0) {
    let url = new URL(window.location.href); //hàm phân tích URL trong javascript

    buttonStatus.forEach((button) => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status");
            if (status) {
                url.searchParams.set("status", status); // Thay đổi status trên thanh url = status( button )
            } else url.searchParams.delete("status");

            window.location.href = url; //Trả về url mới thỏa điều kiện button
        });
    });
}
// End Button Status

// List Deleted Item
const deletedItems = document.querySelector("#deleted-list");
if (deletedItems) {
    deletedItems.addEventListener("click", () => {
        let url = new URL(window.location.href);
        url.searchParams.set("deleted", "deleted");
        window.location.href = url;
    });
}
// End List Deleted Item

// Form Search
const formSearch = document.getElementById("form-search");
if (formSearch) {
    let url = new URL(window.location.href); //hàm phân tích URL trong javascript
    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;
        if (keyword) {
            url.searchParams.set("keyword", keyword); // Thay đổi key word trên thanh url = status( button )
        } else url.searchParams.delete("keyword");

        window.location.href = url; //Trả về url mới thỏa điều kiện button
    });
}
// End Form Search

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

// Check box
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
    const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
    const inputsId = checkboxMulti.querySelectorAll("input[name='id']");

    inputCheckAll.addEventListener("click", () => {
        if (inputCheckAll.checked) inputsId.forEach((input) => (input.checked = true));
        else inputsId.forEach((input) => (input.checked = false));
    });

    inputsId.forEach((input) => {
        input.addEventListener("click", () => {
            const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
            if (countChecked == inputsId.length) inputCheckAll.checked = true;
            else inputCheckAll.checked = false;
        });
    });
}

// Form change Multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
    formChangeMulti.addEventListener("submit", (e) => {
        e.preventDefault();
        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");

        const typeChange = e.target.elements.type.value;

        if (typeChange === "delete-all") {
            const isConfirm = confirm("Bạn có chắc muốn xóa những sản phẩm này không");
            if (!isConfirm) return;
        }

        if (inputChecked.length > 0) {
            let ids = [];

            const inputsId = formChangeMulti.querySelector("input[name='ids']");
            inputChecked.forEach((input) => {
                const id = input.value;

                if (typeChange == "change-position") {
                    const position = input
                        .closest("tr")
                        .querySelector("input[name='position']").value;

                    ids.push(`${id}-${position}`);
                } else ids.push(input.value);
            });

            inputsId.value = ids.join(", ");

            formChangeMulti.submit();
        } else {
            alert("Vui lòng chọn ít nhất một bản ghi");
        }
    });
}

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

// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
    const uploadImageInput = document.querySelector("[upload-image-input]");
    const uploadImagePreview = document.querySelector("[upload-image-preview]");
    const closeImagePreview = document.querySelector("[close-image]");
    uploadImageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadImagePreview.src = URL.createObjectURL(file); // Tạo 1 URL tạm để hiển thị ảnh
            closeImagePreview.style.display = "inline-block";
        }
    });
    closeImagePreview.addEventListener("click", () => {
        uploadImageInput.value = "";
        closeImagePreview.style.display = "none";
        uploadImagePreview.src = "";
    });
}
// End Upload Image

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
    if (sortKey && sortValue) {
        sortSelect.value = `${sortKey}-${sortValue}`;
        sortSelect.selected = true;
    }
}
// End Sort


// Category List
document.addEventListener("DOMContentLoaded", function() {
  const toggles = document.querySelectorAll(".category-toggle");

  toggles.forEach(toggle => {
    if (toggle.checked) {
      const childrenDiv = toggle.closest(".category-item").nextElementSibling;
      if (childrenDiv && childrenDiv.classList.contains("children")) {
        childrenDiv.classList.remove("hidden");
      }
    }
    toggle.addEventListener("change", function() {
      const childrenDiv = this.closest(".category-item").nextElementSibling;
      if (childrenDiv && childrenDiv.classList.contains("children")) {
        childrenDiv.classList.toggle("hidden");
      }
    });
  });
});