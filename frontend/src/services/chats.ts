import {fetchWrapper} from "./utils.ts";
import {ChatCardResponse, ChatCreatedResponse, ChatPayload, ChatResponse, MyChatsResponse} from "../models";

export const getRandomChats = async () => {
    const randomChatsResponse = await fetchWrapper('/chats/');

    if (randomChatsResponse.ok) {
        return (await randomChatsResponse.json()).chats as ChatCardResponse;
    } else {
        return null;
    }
}

export const joinChat = async (chatKey: string) => {
    const joinChatResponse = await fetchWrapper('/chats/join/', {
        method: 'POST',
        pathParam: chatKey,
    });

    return joinChatResponse.ok;
}

export const getMyChats = async (pageNumber: number = 0) => {
    const chatsResponse = await fetchWrapper('/chats/my-chats/', {
        pageNumber,
    });

    if (chatsResponse.ok) {
        return await chatsResponse.json() as MyChatsResponse;
    } else {
        return null;
    }
}

export const getChat = async (chatKey: string) => {
    const chatResponse = await fetchWrapper('/chats/', {
        pathParam: chatKey,
    });

    if (chatResponse.ok) {
        return await chatResponse.json() as ChatResponse;
    } else {
        return null;
    }
}

export const createChat = async (chatPayload: ChatPayload) => {
    const createChatResponse = await fetchWrapper('/chats/', {
        method: 'POST',
        body: JSON.stringify(chatPayload),
    });

    if (createChatResponse.ok) {
        return (await createChatResponse.json() as ChatCreatedResponse).chatKey;
    } else {
        return null;
    }
}
