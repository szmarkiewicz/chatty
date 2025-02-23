import asyncHandler from "express-async-handler";
import {chatRepository} from "../repositories/chats";
import {Chat, User} from "../models";
import {userRepository} from "../repositories/users";

export const CHAT_USERS_PAGE_SIZE = 30;

export const getUsersForChatHandler = asyncHandler(async (req, res) => {
    const chatKey = req.params.chatKey;

    if (chatKey) {
        const pageOffset = parseInt(req.query.pageOffset as string || "0");
        const chat = await chatRepository.fetch(chatKey) as Chat;

        if (chat) {
            const chatUsersKeys = chat.participantsKeys;
            const usernameList = (await userRepository.fetch(chatUsersKeys) as User[]).slice(pageOffset * CHAT_USERS_PAGE_SIZE, CHAT_USERS_PAGE_SIZE).map((user) => user.username);

            res.status(200).json({usernameList});
        } else {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});