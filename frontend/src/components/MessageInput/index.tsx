import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import FileComponent from "../File";
import {v4} from "uuid";
import {AcceptedFileTypes, FileInfo} from "../../models";
import {SocketEvents} from "../../services/sockets.ts";
import useSocket from "../../hooks/useSocket.ts";
import {Socket} from "socket.io-client";
import {useParams} from "react-router";
import "./index.css";

type MessageInputProps = {
    chatSocket?: Socket;
    setFileKeys?: (mediaKeys: string[]) => void;
    disable: boolean;
    buttonText: string;
    onTextChange?: () => void;
}

export default function MessageInput({chatSocket, setFileKeys, disable, buttonText, onTextChange}: MessageInputProps) {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const params = useParams();
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mediaSocket = useSocket('/media');

    const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (files !== null) {
            const newFileArray = Array.from(files).map((file) => ({
                id: v4(),
                mediaKey: null,
                name: file.name,
                size: file.size,
                type: file.type,
            }));
            setFiles(newFileArray);

            const filesResolveFns: { [id: string]: (mediaKey: string) => string } = {}
            for (let i = 0; i < files.length; i++) {
                filesResolveFns[newFileArray[i].id] = (mediaKey: string) => mediaKey;
                mediaSocket.emit(SocketEvents.Media.Upload, files[i], {
                    id: newFileArray[i].id,
                    name: files[i].name,
                    type: files[i].type
                }, (status: "success" | "failure") => {
                    console.log(`File ${files[i].name} status: ${status}`);
                });
            }
        }
    }, []);

    const onTextInput = useCallback(() => {
        onTextChange?.();

        if (chatSocket && params.chatKey) {
            if (typingTimeoutRef.current !== null) {
                clearTimeout(typingTimeoutRef.current);
            } else {
                chatSocket.emit(SocketEvents.Typing.Start, params.chatKey);
            }

            typingTimeoutRef.current = setTimeout(() => {
                chatSocket.emit(SocketEvents.Typing.Finish, params.chatKey);
                typingTimeoutRef.current = null;
            }, 2000);
        }
    }, [chatSocket, params.chatKey, onTextChange]);

    useEffect(() => {
        const listener = (e: SubmitEvent) => {
            setFiles([]);
            ((e.target as HTMLFormElement).elements.namedItem('message-text') as HTMLTextAreaElement)!.value = '';
        };

        addEventListener("submit", listener);

        return () => {
            removeEventListener("submit", listener);
        }
    }, []);

    useEffect(() => {
        mediaSocket.on(SocketEvents.Media.Upload, (fileKey: string, fileId: string) => {
            setFiles((prevState) => {
                const newState = prevState.slice();

                const fileIndex = newState.findIndex((fileInfo) => fileInfo.id === fileId);

                if (fileIndex > -1) {
                    newState[fileIndex].mediaKey = fileKey;
                }

                setFileKeys?.(newState.filter(file => file.mediaKey !== null).map(file => file.mediaKey) as string[])

                return newState;
            });
        });
    }, [mediaSocket]);

    return <div className={'message-input-container'}>
        <div className={'message-area'}>
            <textarea name={'message-text'} className={'message-text'} onChange={onTextInput}></textarea>
            <div className={'message-files'}>
                <label className={'text-button'}>
                    Attach files
                    <input type={'file'} id={'files-input'} name={'files-input'} className={'files-input'} multiple
                           onChange={onFileChange} accept={AcceptedFileTypes.join(',')}/>
                </label>
                <div className={'files-container'}>
                    {files ? files.map((fileInfo) => <FileComponent key={fileInfo.id}
                                                                    mediaKey={fileInfo.mediaKey}
                                                                    type={fileInfo.type}
                                                                    filename={fileInfo.name}
                                                                    size={fileInfo.size}
                                                                    previewOnly={false}/>) : null}
                </div>
            </div>
            <p style={{fontSize: 10, fontWeight: "normal"}}>Accepted file types: {AcceptedFileTypes.join(', ')}</p>
        </div>
        <button type={'submit'} className={'send-message-button'} disabled={disable}>{buttonText}</button>
    </div>
}