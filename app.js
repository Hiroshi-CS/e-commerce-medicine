// import modules
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const moment = require("moment");

require("dotenv").config(); // Init dotenv

const database = require("./config/database");
database.connect(); // connect database

const route = require("./routes/client/index.route"); // client route
const adminRoute = require("./routes/admin/index.route"); //admin route
const systemConfig = require("./config/system"); // Get object systemConfig

const port = process.env.PORT; //  Port my server
const app = express(); // Init app
app.use(methodOverride("_method")); // Override method

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set resource for front end
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser()); // set key cho cookieParser (optional)

// Flash
app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 600000 },
    })
);
app.use(flash());
// End Flash

// TinyMCE
app.use("/tinymce", express.static(path.join(__dirname, "node_modules", "tinymce")));

// App Local Variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

//Route
route(app); // client route
adminRoute(app); // admin route

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`); //Kết nối với port
});
