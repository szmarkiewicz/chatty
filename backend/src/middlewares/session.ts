import session from "express-session";
import {RedisStore} from "connect-redis";
import {redisQueryClient} from "../redis";
import dotenv from "dotenv";

dotenv.config();

export type User = {
    key: string;
    username: string;
};

declare module 'express-session' {
    export interface SessionData {
        user: User
    }
}

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const ONE_DAY = 1000 * 60 * 60 * 24;

// This will maintain a unique session for every client that connects. Session data will be stored in Redis db (user
// key/id and username) and is accessible in request objects
export const sessionMiddleware = session({
    store: new RedisStore({
        client: redisQueryClient,
        prefix: process.env.EXPRESS_SESSION_NAME,
    }),
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET!,
    cookie: {
        maxAge: ONE_DAY,
        sameSite: true,
        secure: IS_PRODUCTION,
    }
});