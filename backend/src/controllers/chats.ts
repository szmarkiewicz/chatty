import asyncHandler from "express-async-handler";
import _ from "lodash";
import {chatRepository} from "../repositories/chats";
import {messageRepository} from "../repositories/messages";
import {Chat, ChatPayload, User} from "../models";
import EntityId from "../utils/entityId";
import {redisQueryClient} from "../redis";
import {userRepository} from "../repositories/users";

const CHATS_PAGE_SIZE = 10;

export const addMessageToSortedSet = (chatKey: string, timestamp: number, messageKey: string) => {
    return redisQueryClient.zAdd(`chat:messages:${chatKey}`, {
        score: timestamp,
        value: messageKey,
    });
}

export const createChat = async (userKey: string, chatPayload: ChatPayload, timestamp: number) => {
    const newChat = await chatRepository.save({
        title: chatPayload.title,
        participantsKeys: [userKey],
        authorKey: userKey,
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const newMessage = await messageRepository.save({
        senderKey: userKey,
        text: chatPayload.text,
        mediaKeys: chatPayload.mediaKeys,
        updatedAt: timestamp
    });

    const newChatKey = newChat[EntityId];
    const newMessageInSortedSet = await addMessageToSortedSet(newChatKey, timestamp, newMessage[EntityId]);

    return {newChat, newChatKey, newMessage, newMessageInSortedSet};
}

export const createChatHandler = asyncHandler(async (req, res) => {
    const userKey = req.session.user!.key;
    const chatPayload = req.body as ChatPayload;

    if (!chatPayload || !chatPayload.text || !chatPayload.title) {
        res.sendStatus(400);
    }

    const timestamp = Date.now();
    const {newChatKey, newMessageInSortedSet} = await createChat(userKey, chatPayload, timestamp);

    if (newMessageInSortedSet !== 1) {
        res.sendStatus(500);
    } else {
        res.status(201).json({chatKey: newChatKey});
    }
});

export const getChatHandler = asyncHandler(async (req, res) => {
    const chatKey = req.params.chatKey;
    const userKey = req.session.user!.key;

    if (chatKey) {
        const chat = await chatRepository.fetch(chatKey) as Chat;
        const user = await userRepository.fetch(chat.authorKey) as User;

        if (chat) {
            res.status(200).json({
                chat: {
                    title: chat.title,
                    author: user.username,
                    participantsCount: chat.participantsKeys.length,
                    createdByUser: user[EntityId] === userKey,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt,
                }
            });
        } else {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});

export const getNewRandomChatsHandler = asyncHandler(async (req, res) => {
    const userKey = req.session.user!.key;

    // Simplification. Should be changed if db gets too big
    const chatIds = await chatRepository.search().where('participantsKeys').not.contain(userKey).allIds();

    const randomChatIds = chatIds.length > 5 ? _.sampleSize(chatIds, 5) : chatIds;
    const randomChats = (await chatRepository.fetch(randomChatIds)).map((chat) => ({
        key: chat[EntityId],
        title: chat.title,
    }));

    if (randomChats) {
        res.status(200).send({chats: randomChats});
    } else {
        res.sendStatus(500);
    }
});

export const joinChatHandler = asyncHandler(async (req, res) => {
    const chatKey = req.params.chatKey;
    const userKey = req.session.user!.key;

    if (chatKey) {
        const chat = await chatRepository.fetch(chatKey) as Chat;

        if (chat.participantsKeys.indexOf(userKey) === -1) {
            chat.participantsKeys.push(userKey);
            await chatRepository.save(chatKey, chat);

            res.sendStatus(200);
        } else {
            res.sendStatus(304);
        }
    } else {
        res.sendStatus(400);
    }
});

export const getMyChatsHandler = asyncHandler(async (req, res) => {
    const userKey = req.session.user!.key;
    const pageOffset = parseInt(req.query.pageOffset as string || "0");

    const chats = (await chatRepository.search().where('participantsKeys').contain(userKey).sortDesc('updatedAt').page(pageOffset * CHATS_PAGE_SIZE, CHATS_PAGE_SIZE + 1)).map((chat) => ({
        key: chat[EntityId],
        title: chat.title,
    }));
    const isMoreAvailable = chats[CHATS_PAGE_SIZE] !== undefined;
    chats.pop();

    res.json({chats, moreAvailable: isMoreAvailable}).status(200);
})

