import express from "express";
import dotenv from "dotenv";
import http from "http";
import socketIo from "socket.io";
import cors from "cors";
import {redisQueryClient} from "./redis";
import bodyParser from "body-parser";
import {authRouter} from "./routes/auth";
import {userRepository} from "./repositories/users";
import {sessionMiddleware} from "./middlewares/session";
import {chatsRouter} from "./routes/chats";
import {chatRepository} from "./repositories/chats";
import {messageRepository} from "./repositories/messages";
import {usersRouter} from "./routes/users";
import {messagesRouter} from "./routes/messages";
import {initializeSocketLogic} from "./socket";
import {mediaRepository} from "./repositories/media";
import {mediaRouter} from "./routes/media";
import initializeDemoData from "./utils/initializeDemoData";

dotenv.config();

const PORT = parseInt(process.env.SERVER_PORT || "3000");
const HOSTNAME = process.argv[2] || process.env.SERVER_HOSTNAME || "localhost";
const CORS_OPTIONS = { origin: process.argv[3] || process.env.CHATTY_CLIENT_BASE_URL, credentials: true };

const app = express();
// Max buffer size set to 20MB (max single file size)
const server = http.createServer(app);
const socketServer = new socketIo.Server(server, {maxHttpBufferSize: 2e7, cors: CORS_OPTIONS});

async function initializeRepositories() {
    await userRepository.createIndex();
    await chatRepository.createIndex();
    await messageRepository.createIndex();
    await mediaRepository.createIndex();
}

async function runServer() {
    redisQueryClient.connect().catch((err) => {
        console.log("Redis Query Client:: Could not connect to Redis instance. Error: ", err);
    });
    redisQueryClient.on("error", (err) => {
        console.log("Redis Query Client:: Error occurred: " + err);
    })
    redisQueryClient.on('connect', function (_err) {
        console.log('Redis Query Client:: Connected successfully.');
    });

    await initializeRepositories();
    await initializeDemoData();
    initializeSocketLogic(socketServer);

    // Middlewares
    app.use(sessionMiddleware);
    app.use(cors(CORS_OPTIONS));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    // Routes
    app.use("/auth", authRouter);
    app.use("/chats", chatsRouter);
    app.use("/users", usersRouter);
    app.use("/messages", messagesRouter);
    app.use("/media", mediaRouter);

    // Start listening
    server.listen(PORT, HOSTNAME, () => {
        console.log(`[server]: Server is running at http://${HOSTNAME}:${PORT}`);
    });
}

runServer().catch(err => {
    console.log("[server] Error caught:\n", err);
});
