export type ChatResponse = {
    chat: Chat
}

export type Chat = {
    title: string,
    author: string,
    createdByUser: boolean,
    participantsCount: number,
    createdAt: string,
    updatedAt: string,
}

export type ChatPayload = {
    title: string,
    text: string,
    mediaKeys?: string[],
}

export type MediaMetadataResponse = {
    type: string,
    size: number,
    filename: string,
}

export type ChatCreatedResponse = {
    chatKey: string;
}

export type UsersForChatResponse = {
    usernameList: string[]
}

export type UserData = {
    username: string;
    password: string;
}

export type ChatCardResponse = {
    key: string;
    title: string;
}[];

export type MyChatsResponse = {
    chats: ChatCardResponse;
    moreAvailable: boolean;
}

export type ChatCardData = {
    key: string;
    title: string;
    joined: boolean;
}

export const ImageTypes = {
    Gif: "image/gif",
    Jpeg: "image/jpeg",
    Png: "image/png",
    Svg: "image/svg+xml",
    Webp: "image/webp",
}
export type ImageTypesKeys = keyof typeof ImageTypes;
export type ImageTypesValues = typeof ImageTypes[ImageTypesKeys];

export const VideoTypes = {
    Mp4: "video/mp4",
    Webm: "video/webm",
    Quicktime: "video/quicktime",
}
export type VideoTypesKeys = keyof typeof VideoTypes;
export type VideoTypesValues = typeof VideoTypes[VideoTypesKeys];

export const AudioTypes = {
    Wav: "audio/wav",
    Webm: "audio/webm",
    Mp4: "audio/mp4",
    Mp3: "audio/mpeg",
    Flac: "audio/flac",
}
export type AudioTypesKeys = keyof typeof AudioTypes;
export type AudioTypesValues = typeof AudioTypes[AudioTypesKeys];

export const AcceptedFileTypes = Object.values(ImageTypes).concat(Object.values(AudioTypes), Object.values(VideoTypes));

export type Message = {
    sentByUser: boolean;
    username: string,
    text: string,
    mediaKeys: string[],
    createdAt: number,
    updatedAt: number
}

export type FileInfo = {
    id: string;
    mediaKey: string | null;
    name: string | null;
    type: string | null;
    size: number | null;
};