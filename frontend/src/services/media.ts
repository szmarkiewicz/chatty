import {fetchWrapper} from "./utils.ts";
import {MediaMetadataResponse} from "../models";

export const getMediaMetadata = async (mediaKey: string) => {
    const mediaResponse = await fetchWrapper('/media/metadata/', {pathParam: mediaKey});

    if (mediaResponse.ok) {
        return (await mediaResponse.json()) as MediaMetadataResponse;
    } else {
        return null;
    }
}