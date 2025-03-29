// Change avatar
const avatarInput = document.getElementById("avatar-input");
const avatarPreview = document.getElementById("avatar-preview");
const removeAvatarBtn = document.getElementById("remove-avatar-btn");
const changeAvatarBtn = document.getElementById("change-avatar-btn");

// Khi người dùng nhấn nút "Thay đổi avatar", kích hoạt input file
changeAvatarBtn.addEventListener("click", () => {
    avatarInput.click(); // Kích hoạt hành động chọn tệp
});
let avatarStorage = "";
if (avatarPreview.src != "/uploads/avatar-default.jpg") avatarStorage = avatarPreview.src;
// Khi người dùng chọn một file
avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarPreview.src = e.target.result; // Hiển thị ảnh mới
            removeAvatarBtn.style.display = "block"; // Hiển thị nút X
        };
        reader.readAsDataURL(file);
    }
});

// Khi người dùng nhấn nút X để quay lại avatar mặc định
removeAvatarBtn.addEventListener("click", () => {
    if (avatarStorage != "") avatarPreview.src = avatarStorage;
    else avatarPreview.src = avatarPreview.dataset.defaultAvatar || "/uploads/avatar-default.jpg";
    avatarInput.value = ""; // Xóa file đã chọn
    removeAvatarBtn.style.display = "none"; // Ẩn nút X
});

// Order Detail
const openModalButton = document.querySelectorAll("[open-modal-button]");
const modal = document.getElementById("modal");
const closeButton = document.getElementById("close-button");

if (openModalButton.length > 0) {
    openModalButton.forEach((button) => {
        button.addEventListener("click", function () {
            const index = button.getAttribute("data-index");
            window.location.href = `/user/orderDetail/${index}`;
        });
    });
}
if (modal && closeButton) {
    closeButton.addEventListener("click", function () {
        modal.style.display = "none";
    });
}
