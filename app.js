// import modules
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const moment = require("moment");
const generateRandomString = require("./helper/generate");

require("dotenv").config(); // Init dotenv

const database = require("./config/database");
database.connect(); // connect database

const route = require("./routes/client/index.route"); // client route
const adminRoute = require("./routes/admin/index.route"); //admin route
const systemConfig = require("./config/system"); // Get object systemConfig
const { match } = require("assert");

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
const io = new Server(httpServer, {
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
});

io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        // find session
        const session = 0;
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.username = session.username;
            return next();
        } else {
            const username = socket.handshake.auth.username;
            if (!username) {
                return next(new Error("invalid username"));
            }
            // create new session
            socket.sessionID = generateRandomString();
            socket.username = username;
            next();
        }
    }
});

io.on("connection", (socket) => {
    // Join room private
    socket.join(socket.userID);

    // Return unique sessionID when connect
    socket.emit("session", {
        sessionID: socket.sessionID,
    });

    // Handle disconnected of user
    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userID).fetchSockets(); // Get all
        const isStillConnect = matchingSockets == 0;
        if (isStillConnect) {
            socket.broadcast.emit("User disconnected", socket.userID); // notify for another people
        }
    });

    // Handle give private message
    socket.on("private message", ({ content, to }) => {
        const message = {
            content,
            from: socket.userID,
            to,
        };
        socket.to(to).to(socket.userID).emit("private message", message);
    });
});

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`); //Kết nối với port
});
