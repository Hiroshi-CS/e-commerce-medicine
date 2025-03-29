// Change Status

const buttonChangStatus = document.querySelectorAll("[button-change-status");
if (buttonChangStatus.length > 0) {
    const fromChangeStatus = document.querySelector("#form-change-status");
    const path = fromChangeStatus.getAttribute("data-path");

    buttonChangStatus.forEach((button) => {
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");

            let statusChange = statusCurrent === "active" ? "inactive" : "active";
            const action = path + `/${statusChange}/${id}?_method=PATCH`;
            fromChangeStatus.action = action;

            fromChangeStatus.submit();
        });
    });
}
// End Change Status

// Delete/Restore Item
const buttonsDelete = document.querySelectorAll("[button-delete-restore]");
if (buttonsDelete.length > 0) {
    const formDeleteRestore = document.querySelector("#form-delete-restore");
    const path = formDeleteRestore.getAttribute("data-path");

    buttonsDelete.forEach((button) => {
        button.addEventListener("click", () => {
            const isDeleted = button.getAttribute("value");
            if (isDeleted == "Xóa") {
                const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này?");

                if (isConfirm) {
                    const id = button.getAttribute("data-id");

                    const action = `${path}/delete/${id}?_method=DELETE`;

                    formDeleteRestore.action = action;
                    formDeleteRestore.submit();
                }
            } else {
                const isConfirm = confirm("Bạn có chắc muốn khôi phục sản phẩm này?");

                if (isConfirm) {
                    const id = button.getAttribute("data-id");

                    const action = `${path}/restore/${id}?_method=PATCH`;

                    formDeleteRestore.action = action;
                    formDeleteRestore.submit();
                }
            }
        });
    });
}
// End Delete/Restore Item
