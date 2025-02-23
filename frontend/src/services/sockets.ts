import {Manager} from "socket.io-client";
import {BASE_URL} from "./utils.ts";

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

export const socketManager = new Manager(BASE_URL, {withCredentials: true});

