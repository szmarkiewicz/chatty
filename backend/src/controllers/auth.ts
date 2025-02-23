import bcrypt from 'bcrypt';
import {userRepository} from "../repositories/users";
import asyncHandler from "express-async-handler";
import EntityId from "../utils/entityId";
import dotenv from "dotenv";

dotenv.config();

export const saveNewUser = async (username: string, password: string) => {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const creationDate = Date.now();
    return userRepository.save({
        username,
        password: hashedPassword,
        createdAt: creationDate,
        updatedAt: creationDate
    });
}

export const registerUserHandler = asyncHandler(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.sendStatus(400);
    }

    const usernameTaken = await userRepository.search().where('username').equals(username).return.first();

    if (usernameTaken) {
        res.sendStatus(409);
    }

    const newUser = await saveNewUser(username, password);

    if (newUser) {
        res.sendStatus(201);
    } else {
        res.sendStatus(500);
    }
});

export const loginHandler = asyncHandler(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.sendStatus(400);
    }

    const user = await userRepository.search().where('username').equals(username).return.first();

    if (user) {
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
            req.session.user = {
                key: user[EntityId],
                username,
            };

            res.json({username}).status(200);
        } else {
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(404);
    }
});

export const logoutHandler = asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

export const authenticateHandler = asyncHandler(async (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.sendStatus(401);
    }
});