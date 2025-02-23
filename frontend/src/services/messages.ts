import {fetchWrapper} from "./utils.ts";
import {Message} from "../models";

export const getMessagesForChat = async (chatKey: string, pageNumber?: number) => {
    console.log("chatkey:", chatKey, pageNumber);

    const messageResponse = await fetchWrapper('/messages/', {
        pathParam: chatKey,
        pageNumber,
    });

    if (messageResponse.ok) {
        return (await messageResponse.json()).messages as Message[];
    } else {
        return null;
    }
};