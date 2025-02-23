import {Router} from "express";
import {authenticateHandler} from "../controllers/auth";
import {getMessageHistoryForChatHandler} from "../controllers/messages";

export const messagesRouter = Router();

// Retrieves a page (20) of messages for a given chat
messagesRouter.get('/:chatKey', authenticateHandler, getMessageHistoryForChatHandler);
