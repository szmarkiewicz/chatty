import {fetchWrapper} from "./utils.ts";
import {UserData} from "../models";

export const login = async (userData: UserData) => {
    const userAuthResponse = await fetchWrapper('/auth/login', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

    if (userAuthResponse.ok) {
        return {
            loggedIn: true,
            username: (await userAuthResponse.json()).username
        };
    } else {
        return {
            status: userAuthResponse.status,
            loggedIn: false,
        }
    }
}

export const signup = async (userData: UserData) => {
    return await fetchWrapper('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export const logout = async () => {
    const userAuthResponse = await fetchWrapper('/auth/logout', {
        method: 'POST',
    });

    return userAuthResponse.ok;
}