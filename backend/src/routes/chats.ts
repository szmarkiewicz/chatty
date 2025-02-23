import {Router} from "express";
import {authenticateHandler} from "../controllers/auth";
import {
    createChatHandler,
    getChatHandler,
    getMyChatsHandler,
    getNewRandomChatsHandler,
    joinChatHandler
} from "../controllers/chats";

export const chatsRouter = Router();

// Create a new chat
chatsRouter.post('/', authenticateHandler, createChatHandler);

// Get 5 random unique chats: returns ids and titles
chatsRouter.get('/', authenticateHandler, getNewRandomChatsHandler);

// Get all chats that user joined, paged
chatsRouter.get('/my-chats', authenticateHandler, getMyChatsHandler);

// Get chat details: title, author, participants count, creation/update dates
chatsRouter.get('/:chatKey', authenticateHandler, getChatHandler);

// Join a chat
chatsRouter.post('/join/:chatKey', authenticateHandler, joinChatHandler);
