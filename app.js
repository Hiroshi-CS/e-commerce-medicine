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

io.use(async (socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        //  Find session
        const session = await sessionChatModel.findOne({ sessionId: sessionID });
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.username = session.username;
            socket.role = session.role;
            socket.connected = true;

            // update and save session
            session.connected = true;
            session.updatedAt = Date.now();
        } else {
            const username = socket.handshake.auth.username;
            if (!username) {
                return next(new Error("invalid username"));
            }

            // create new session
            socket.sessionID = generateRandomString();
            socket.userID = socket.handshake.auth.userID;
            socket.username = username;
            socket.role = socket.handshake.auth.role;
            socket.connected = true; // set connected to true

            // Create and save session to database
            session = new sessionChatModel({
                sessionId: socket.sessionID,
                userId: socket.userID,
                username: username,
                role: socket.role,
            });
        }

        // Save session to database
        await session.save();

        // next to middleware
        return next();
    }
});

io.on("connection", async (socket) => {
    // Join room private
    socket.join(socket.userID);

    // Send notify when connected
    if (socket.role == "admin") {
        socket.broadcast.emit("Admin connected", socket.userID); // notify for another people
    } else {
        const toAdmin = await sessionChatModel.findOne({ role: "admin" }).select("sessionId"); // get session id of admin
        socket.to(toAdmin).emit("User connected", socket.userID); // notify for admin
    }

    // Get all session of user
    /*
        1. Get all session of user for sender is admin
        2. Get session of admin for sender is user
    */
    const sessionUsers = null;
    const roleUser = socket.role == "admin" ? "user" : "admin"; // get role of user

    // Get session of user
    sessionUsers = await sessionChatModel
        .findOne({
            role: roleUser,
        })
        .select("-createdAt");

    // Get messages of session
    const promiseGetMessagesForEachUser = sessionUsers.map(async (session) => {
        const conversation = await conversationModel
            .findOne({
                listUsers: { $all: [socket.userID, session.userId] },
            })
            .select("_id");

        if (conversation) {
            const messages = await messagesModel
                .find({
                    conversationId: conversation._id,
                })
                .sort({
                    createdAt: -1,
                })
                .limit(10)
                .lean();

            session.messages = messages; // add messages to session
        }

        return session; // return session of user
    });

    await Promise.all(promiseGetMessagesForEachUser); // wait for all messages
    socket.emit("sessionUsers", promiseGetMessagesForEachUser); // Send session another people to user

    // Send session to user
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
        username: socket.username,
        role: socket.role,
        connected: socket.connected,
    });

    // Handle disconnected of user
    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userID).fetchSockets(); // Get all
        const isStillConnect = matchingSockets == 0;
        if (isStillConnect) {
            // Check if user is role admin
            /*
                1. admin when disconnect will send notification to all user
                2. user when disconnect will send notification to admin
            */
            if (socket.role == "admin") {
                socket.broadcast.emit("Admin disconnected", socket.userID); // notify for another people
            } else {
                const toAdmin = await sessionChatModel
                    .findOne({ role: "admin" })
                    .select("sessionId"); // get session id of admin
                socket.to(toAdmin).emit("User disconnected", socket.userID); // notify for admin
            }

            const session = await sessionChatModel.findOne({ sessionId: socket.sessionID });
            if (session) {
                // update and save session
                session.connected = false;
                session.updatedAt = Date.now();
                await session.save();
            }
        }
    });

    // Handle send private message
    socket.on("private message", async ({ content, to }) => {
        // Create message
        const message = {
            content,
            from: socket.userID,
            to,
        };

        // Save message to database
        const conversation = await conversationModel
            .findOne({
                listUsers: { $all: [socket.userID, to] },
            })
            .select("_id");

        // check conversation exist
        if (!conversation) {
            // create new conversation
            conversation = new conversationModel({
                listUsers: [socket.userID, to],
                lastMessage: content,
                updateAt: Date.now(),
            });
        }

        // Create new message
        const newMessage = new messagesModel({
            sender: socket.userID,
            message: content,
            conversationId: conversation._id,
        });

        await newMessage.save(); // save message to database

        // Update conversation and save
        conversation.lastMessage = content;
        conversation.updateAt = Date.now();
        await conversation.save();

        socket.to(to).to(socket.userID).emit("private message", message);
    });
});

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`); //Kết nối với port
});
