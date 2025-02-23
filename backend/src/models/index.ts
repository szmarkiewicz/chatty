export type DateInfo = {
    createdAt: number;
    updatedAt: number;
}

export type MessagePayload = {
    text: string;
    mediaKeys?: string[];
}

export type Chat = {
    title: string;
    authorKey: string;
    participantsKeys: string[];
} & DateInfo;

export type ChatPayload = {
    title: string;
} & MessagePayload;

export type User = {
    username: string,
    password: string,
} & DateInfo;
