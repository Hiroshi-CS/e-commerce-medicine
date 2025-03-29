module.exports = (query) => {
    let filterStatus = [
        {
            name: "Tất cả",
            status: "",
            class: "active",
        },
        {
            name: "Hoạt động",
            status: "active",
            class: "",
        },
        {
            name: "Dừng hoạt động",
            status: "inactive",
            class: "",
        },
    ];

    Status = query.status; // Gán giá trị status từ url
    if (Status) {
        // Kiểm tra status có tồn tại
        filterStatus.forEach((item) => {
            item.status === Status ? (item.class = "active") : (item.class = "");
        });
    } // TH không tồn tại, trả lại cho lựa chọn tất cả
    else filterStatus[0].class = "active";

    return filterStatus;
};
