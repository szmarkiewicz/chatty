import {Server} from "socket.io";
import {SessionData} from "express-session";
import {sessionMiddleware} from "./middlewares/session";
import {mediaRepository} from "./repositories/media";
import EntityId from "./utils/entityId";
import {messageRepository} from "./repositories/messages";
import {redisQueryClient} from "./redis";
import {addMessageToSortedSet} from "./controllers/chats";
import {getChecksum} from "./controllers/media";

export const SocketEvents = {
    Message: {
        Send: "message.send",
        Edit: "message.edit",
        Remove: "message.remove",
    },
    Media: {
        Upload: "media.upload",
        Remove: "media.remove",
    },
    Typing: {
        Start: "typing.start",
        Finish: "typing.finish",
    },
    OnlineUsers: "onlineUsers",
    Chat: {
        Enter: "chat.enter",
        Leave: "chat.leave",
    }
};

type MessagePayload = {
    chatKey: string;
    text: string;
    mediaKeys?: string[];
}

type FileInfo = {
    id: string;
    name: string;
    type: string;
}

const addOnlineUser = async (userKey: string) => {
    return redisQueryClient.sAdd('users-online', userKey);
};

const removeOnlineUser = async (userKey: string) => {
    return redisQueryClient.sRem('users-online', userKey);
};

const getOnlineUsersCount = async () => {
    return redisQueryClient.sCard('users-online');
};

export const initializeSocketLogic = (socketServer: Server) => {
    socketServer.engine.use(sessionMiddleware);

    socketServer.of('/').on("connect", async (socket) => {
        const sessionData = socket.request["session"] as SessionData;

        if (!sessionData.user) {
            return;
        }

        await addOnlineUser(sessionData.user.key);
        console.log("[Socket] User ", sessionData.user.username, " connected");
        socket.nsp.emit(SocketEvents.OnlineUsers, await getOnlineUsersCount());

        socket.on("disconnect", async () => {
            console.log("[Socket] User ", sessionData.user.username, " disconnected");
            await removeOnlineUser(sessionData.user.key);
            socket.nsp.emit(SocketEvents.OnlineUsers, await getOnlineUsersCount());
        });
    });

    socketServer.of('/media').on("connect", async (socket) => {
        const sessionData = socket.request["session"] as SessionData;

        if (!sessionData.user) {
            return;
        }

        socket.on(SocketEvents.Media.Upload, async (file: Buffer, fileInfo: FileInfo, statusCallback: (status: "success" | "failure") => void) => {
            console.log("[Socket] User ", sessionData.user.username, " is uploading file ", fileInfo.name);

            try {
                const fileChecksum = await getChecksum(file);

                let fileKey = await mediaRepository.search().where('checksum').equals(fileChecksum).returnFirstId();

                if (fileKey === null) {
                    const mediaFile = await mediaRepository.save({
                        checksum: fileChecksum,
                        filename: fileInfo.name,
                        contentType: fileInfo.type,
                        data: file.toString('base64'),
                        createdAt: Date.now(),
                    });
                    fileKey = mediaFile[EntityId];
                }

                if (fileKey) {
                    statusCallback("success");
                    socket.emit(SocketEvents.Media.Upload, fileKey, fileInfo.id);
                } else {
                    statusCallback("failure");
                }
            } catch (error) {
                console.log("[Socket] Failed to upload file ", fileInfo.name, error);
                statusCallback("failure");
            }
        });
        socket.on(SocketEvents.Media.Remove, async (mediaKey: string) => {
            console.log("[Socket] User ", sessionData.user.username, " is removing file with id ", mediaKey);

            try {
                await mediaRepository.remove(mediaKey);

                socket.emit(SocketEvents.Media.Remove, mediaKey);
            } catch (error) {
                console.log("[Socket] Failed to remove file with key ", mediaKey);
            }
        });
    });

    socketServer.of('/chat').on("connect", async (socket) => {
        const sessionData = socket.request["session"] as SessionData;

        if (!sessionData.user) {
            return;
        }

        console.log("[Socket] User ", sessionData.user.username, " connected to chat socket.");

        // When user joins chat (enters the view)
        socket.on(SocketEvents.Chat.Enter, async (chatKey) => {
            console.log("[Socket] User ", sessionData.user.username, " entered chat with id ", chatKey);
            socket.join(chatKey);
        });
        socket.on(SocketEvents.Chat.Leave, async (chatKey) => {
            console.log("[Socket] User ", sessionData.user.username, " left chat with id ", chatKey);
            socket.leave(chatKey);
        });

        // Sending messages
        socket.on(SocketEvents.Message.Send, async (messagePayload: MessagePayload, callback) => {
            console.log("[Socket] User ", sessionData.user.username, " is sending message", messagePayload);

            try {
                const timestamp = Date.now();
                const message = await messageRepository.save({
                    senderKey: sessionData.user.key,
                    text: messagePayload.text,
                    mediaKeys: messagePayload.mediaKeys,
                    updatedAt: timestamp
                });
                await addMessageToSortedSet(messagePayload.chatKey, timestamp, message[EntityId]);

                socket.broadcast.to(messagePayload.chatKey).emit(SocketEvents.Message.Send, {
                    username: sessionData.user.username,
                    sentByUser: false,
                    text: message.text,
                    mediaKeys: message.mediaKeys,
                    createdAt: message.updatedAt,
                    updatedAt: message.updatedAt
                });

                socket.emit(SocketEvents.Message.Send, {
                    username: sessionData.user.username,
                    sentByUser: true,
                    text: message.text,
                    mediaKeys: message.mediaKeys,
                    createdAt: message.updatedAt,
                    updatedAt: message.updatedAt
                });
            } catch (e) {
                console.log("[Socket] Failed to send message to chat ", messagePayload.chatKey);
            }
        });

        // Handling typing events
        socket.on(SocketEvents.Typing.Start, (chatKey: string) => {
            console.log("[Socket] User ", sessionData.user.username, " started typing.");
            socket.broadcast.to(chatKey).emit(SocketEvents.Typing.Start, sessionData.user.username);
        });
        socket.on(SocketEvents.Typing.Finish, (chatKey: string) => {
            console.log("[Socket] User ", sessionData.user.username, " stopped typing.");
            socket.broadcast.to(chatKey).emit(SocketEvents.Typing.Finish, sessionData.user.username);
        });
    });
};