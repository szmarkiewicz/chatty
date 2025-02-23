import {Router} from "express";
import {registerUserHandler, loginHandler, logoutHandler} from "../controllers/auth";

export const authRouter = Router();

// Login by providing credentials. Returns username
authRouter.post('/login', loginHandler);

// Signup by providing credentials. Username must be unique
authRouter.post('/signup', registerUserHandler);

// Logout - destroys session with cookie that contains session id
authRouter.post('/logout', logoutHandler);
