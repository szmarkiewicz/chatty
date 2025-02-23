import asyncHandler from "express-async-handler";
import {redisQueryClient} from "../redis";
import {messageRepository} from "../repositories/messages";
import {userRepository} from "../repositories/users";
import EntityId from "../utils/entityId";

export const MESSAGE_PAGE_SIZE = 20;

export const getMessageHistoryForChatHandler = asyncHandler(async (req, res) => {
    const userKey = req.session.user!.key;
    const chatKey = req.params.chatKey;
    const pageOffset = parseInt(req.query.pageOffset as string || "0");

    if (chatKey) {
        const messagesTimestampAndKey = await redisQueryClient.zRangeWithScores(`chat:messages:${chatKey}`, pageOffset * MESSAGE_PAGE_SIZE, (pageOffset + 1) * MESSAGE_PAGE_SIZE);
        const messages = await messageRepository.fetch(messagesTimestampAndKey.map((item) => item.value));
        const users = await userRepository.fetch(messages.map((message) => message.senderKey));

        res.json({
            messages: messages.map((message, index) => ({
                sentByUser: users[index][EntityId] === userKey,
                username: users[index].username,
                text: message.text,
                mediaKeys: message.mediaKeys,
                createdAt: messagesTimestampAndKey[index].score,
                updatedAt: message.updatedAt
            }))
        }).status(200);
    } else {
        res.sendStatus(400);
    }
});
