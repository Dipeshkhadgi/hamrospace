import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import os from "os";
import morgan from "morgan";
import colors from "colors";
import cors from "cors";
import ConnectDB from "./config/db.js";
import userRoute from "./routes/userRoute/user.js";
import chatRoute from "./routes/chatRoute/chat.js";
import adminRoute from "./routes/adminRoute/admin.js";
import postRoute from "./routes/postRoute/postRoute.js";
import { errorListening } from "./middlewares/error.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/event.js";
import { v4 as uuid } from "uuid";
import { getSocket } from "./lib/helper.js";
import Message from "./models/messageModel/message.js";
import { corsOptions } from "./config/allowOrigin.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser"

//env config
dotenv.config();

const PORT = process.env.PORT || 5000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const usersocketIDs = new Map();

//Database Connection
ConnectDB();

//cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// CORS configuration
app.use(cors(corsOptions));

//routing
app.use("/api/v1", userRoute);
app.use("/api/v1", chatRoute);
app.use("/api/v1", adminRoute);
app.use("/api/v1", postRoute);

//app is working or not
app.use("/", (req, res) => {
  res.send("<h1>Server is Working</h1>");
});

io.use((socket, next) => {

  const token = socket.handshake.auth.token;
  if (!token) {
   
    return next(new Error("Authentication error: Token missing"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    next();
  } catch (err) {
    console.error("Invalid token", err);
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = {
    _id: "123",
    name: "John Doe",
  };
  usersocketIDs.set(user._id.toString(), socket.id);
  console.log("a user connected", socket.id);
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    // Log members to inspect the data
    console.log("Received members:", members);

    if (!Array.isArray(members)) {
      console.error("Invalid members data:", members);
      return;
    }

    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSocket(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      message: messageForRealTime,
      chatId,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    usersocketIDs.delete(user._id.toString());
  });
});
//Error Listening
app.use(errorListening);
//server listening on PORT

server.listen(PORT, "0.0.0.0", () => {
  const networkInterfaces = os.networkInterfaces();
  const localIP = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal)?.address;

  console.log(
    `📌 Server is running at ${envMode} Mode:\n`.bold +
      `   - Localhost: `.blue.bold +
      `http://localhost:${PORT}\n`.cyan.underline +
      `   - Network:   `.blue.bold +
      `http://${localIP}:${PORT}`.cyan.underline
  );
  console.log("===========================================".green.bold);
  console.log(`💡 TIP: Use Network URL to test on other devices!`.yellow);
});

export { usersocketIDs };
