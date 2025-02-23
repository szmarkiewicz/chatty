import { Router } from "express";
import {getUsersForChatHandler} from "../controllers/users";

export const usersRouter = Router();

// [NOT USED] Gets all usernames of users that are participants of a given chat
usersRouter.get('/chats/:chatKey', getUsersForChatHandler);
