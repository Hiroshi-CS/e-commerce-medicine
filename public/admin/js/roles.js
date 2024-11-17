// Permissions
const tablePermissions = document.querySelector("[table-permissions]");
if (tablePermissions) {
  const buttonSubmit = document.querySelector("[button-submit]");
  buttonSubmit.addEventListener("click", () => {
    let permissions = [];

    const rows = tablePermissions.querySelectorAll("[data-name]");

    rows.forEach((row) => {
      const name = row.getAttribute("data-name");
      const inputs = row.querySelectorAll("input");
      if (name == "id") {
        inputs.forEach((input) => {
          const id = input.value;
          permissions.push({
            id: id,
            permissions: [],
          });
        });
      } else {
        inputs.forEach((input, index) => {
          const checked = input.checked;
          if (checked) permissions[index]["permissions"].push(name);
        });
      }
    });
    if (permissions.length > 0) {
      const formChangePermission = document.querySelector(
        "#form-change-permissions"
      );
      const inputPermissions = formChangePermission.querySelector(
        "input[name='permissions']"
      );
      inputPermissions.value = JSON.stringify(permissions)
      formChangePermission.submit()
    }
  });
}
// End Permissions

// Permission Data Default
const dataRecord = document.querySelector("[data-records]")
if(dataRecord){
  const records = JSON.parse(dataRecord.getAttribute("data-records"));
  
  const tablePermissions = document.querySelector("[table-permissions]");
  if (tablePermissions) {
    const rows = tablePermissions.querySelectorAll("[data-name]");
    rows.forEach((row) => {
      const name = row.getAttribute("data-name");
      const inputs = row.querySelectorAll("input");
      inputs.forEach((input, index) => {
        const isChecked = records[index]["permissions"].find(item =>item == name)
        if (isChecked)
          input.checked = true
      })
    })
  }
}
// End Permission Data Default