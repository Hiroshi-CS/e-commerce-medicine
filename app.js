const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");

require("dotenv").config();

const database = require("./config/database");
const route = require("./routes/client/index.route");
const adminRoute = require("./routes/admin/index.route");
const systemConfig = require("./config/system");

database.connect();

const app = express();
app.use(methodOverride("_method"));
const port = process.env.PORT;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Flash
app.use(cookieParser("My adorable Jia"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
// End Flash
app.use(express.static(`${__dirname}/public`));

// App Local Variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;

//Route
route(app);
adminRoute(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
