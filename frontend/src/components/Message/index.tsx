import FileComponent from "../File";
import {useEffect, useState} from "react";
import {FileInfo} from "../../models";
import {getMediaMetadata} from "../../services/media.ts";
import {v4} from "uuid";
import "./index.css";

export type MessageProps = {
    sentByUser: boolean;
    author: string;
    text: string;
    mediaKeys: string[];
    createdAt: number;
    updatedAt: number;
}

export default function Message({sentByUser, author, text, mediaKeys, createdAt, updatedAt}: MessageProps) {
    const [media, setMedia] = useState<FileInfo[]>(mediaKeys.map(() => ({
        id: v4(),
        mediaKey: null,
        name: null,
        type: null,
        size: null
    })));
    const date = new Date(updatedAt);

    useEffect(() => {
        mediaKeys.forEach((mediaKey, index) => getMediaMetadata(mediaKey).then((media) => {
            if (media) {
                console.log(media);

                setMedia((prevState) => {
                    const newState = [...prevState];

                    if (newState[index]) {
                        newState[index].mediaKey = mediaKey;
                        newState[index].size = media.size;
                        newState[index].name = media.filename;
                        newState[index].type = media.type;
                    }

                    return newState;
                });
            }
        }));
    }, [mediaKeys]);

    return <div className={`message-container ${sentByUser ? 'sentByUser' : ''}`}>
        <span
            className={'smaller-footnote-text'}
            style={{margin: 3}}>{author} &#183; {date.toLocaleTimeString()} {date.toLocaleDateString()} {createdAt !== updatedAt ? "· Edited" : ""}</span>
        <div className={`message-body ${sentByUser ? 'sentByUser' : ''}`}>
            <span className={"message-text-content"}>{text}</span>
            <div className={'message-file-content'}>
                {media.length > 0 ? media.map((fileInfo) => <FileComponent key={fileInfo.id}
                                                                           mediaKey={fileInfo.mediaKey}
                                                                           previewOnly={true}
                                                                           type={fileInfo.type}
                                                                           filename={fileInfo.name}
                                                                           size={fileInfo.size}/>) : null}
            </div>
        </div>
    </div>;
};