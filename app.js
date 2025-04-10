// import modules
const express = require("express");
const { createServer } = require("http");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const moment = require("moment");

const generateRandomString = require("./helper/generate.js");
const sessionChatModel = require("./models/sessionChat.model.js");
const conversationModel = require("./models/conversation.model.js");
const messagesModel = require("./models/messages.model.js");

require("dotenv").config(); // Init dotenv

const database = require("./config/database");
database.connect(); // connect database

const route = require("./routes/client/index.route"); // client route
const adminRoute = require("./routes/admin/index.route"); //admin route
const systemConfig = require("./config/system"); // Get object systemConfig
const { match } = require("assert");
const initSocketServer = require("./socket/socket-server"); // Import file socket

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

// TinyMCE
app.use("/tinymce", express.static(path.join(__dirname, "node_modules", "tinymce")));

// App Local Variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

//Route
route(app); // client route
adminRoute(app); // admin route

const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`); //Kết nối với port
});