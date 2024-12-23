// Gọi các module cần thiết
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const moment = require("moment");

require("dotenv").config(); // Cú pháp env

const database = require("./config/database"); // Gọi tới database
const route = require("./routes/client/index.route"); // client route
const adminRoute = require("./routes/admin/index.route"); //admin route
const systemConfig = require("./config/system"); // Lấy path

database.connect(); // connect database

const port = process.env.PORT ; //  gọi Port trong file env (file này chứa thông tin quan trọng)
const app = express(); // Trung tâm của Exprees, cho phép thực hiện các chức năng dưới
app.use(methodOverride("_method")); // cho phép ghi đè phương thức trong Form

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // Giải mã url

app.set("views", `${__dirname}/views`); // Vị trí các file pug (cấu hình nên html)
app.set("view engine", "pug"); // Sử dụng view engine là pug
app.use(express.static(`${__dirname}/public`)); //Cấu hình file tĩnh

// Flash
app.use(cookieParser()); // set key cho cookieParser (optional)
app.use(session({  
  secret: 'your-secret-key',   
  resave: false,               
  saveUninitialized: true,
  cookie: { maxAge: 600000 } }));
app.use(flash());
// End Flash

// TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);
// End TinyMCE

// App Local Variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

//Route
route(app); // client route
adminRoute(app); // admin route

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`); //Kết nối với port
});       
