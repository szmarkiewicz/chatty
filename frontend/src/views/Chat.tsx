import {useNavigate, useParams} from "react-router";
import {FormEvent, useCallback, useEffect, useRef, useState} from "react";
import {getChat} from "../services/chats.ts";
import {Chat as ChatModel} from "../models";
import {FadeLoader} from "react-spinners";
import MessageInput from "../components/MessageInput";
import {SocketEvents} from "../services/sockets.ts";
import MessagesContainer from "../components/MessagesContainer";
import useSocket from "../hooks/useSocket.ts";
import {getFormData} from "../services/utils.ts";
import {Socket} from "socket.io-client";
import "./Chat.css";

export default function Chat() {
    const params = useParams();
    const navigate = useNavigate();
    const [chat, setChat] = useState<ChatModel | null>(null);
    const onConnect = useCallback(() => ({
        listener: (socket: Socket) => {
            socket.emit(SocketEvents.Chat.Enter, params.chatKey);
        },
        cleanup: (socket: Socket) => socket.removeAllListeners(SocketEvents.Chat.Enter),
    }), [params.chatKey]);
    const onDisconnect = useCallback(() => ({
        listener: (socket: Socket) => {
            socket.emit(SocketEvents.Chat.Leave, params.chatKey);
        },
        cleanup: (socket: Socket) => socket.removeAllListeners(SocketEvents.Chat.Leave),
    }), [params.chatKey]);
    const chatSocket = useSocket(
        '/chat',
        onConnect,
        onDisconnect
    );
    const fileKeys = useRef<string[]>([]);

    const setKeys = (keys: string[]) => {
        fileKeys.current = keys;
    }

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!params.chatKey) return;

        const {strings} = getFormData(e);

        chatSocket.emit(SocketEvents.Message.Send, {
            chatKey: params.chatKey,
            text: strings['message-text'],
            mediaKeys: fileKeys.current
        });
    };

    useEffect(() => {
        if (params.chatKey) {
            getChat(params.chatKey).then((response) => {
                if (response?.chat) {
                    setChat(response.chat);
                }
            });
        } else {
            navigate(-1);
        }
    }, [params.chatKey, navigate]);

    return <div className={'chat-container'}>
        <div className={'chat-header'}>
            {chat ? <>
                    <span className={'footnote-text'}>Posted {new Date(chat.createdAt).toLocaleDateString()} &#183; Last updated {new Date(chat.updatedAt).toLocaleDateString()} &#183; {chat.participantsCount} participant{chat.participantsCount === 1 ? '' : 's'}</span>
                    <span className={'title-text'}>{chat.title}</span>
                    <span
                        className={'footnote-text'}>Author: <b>{chat.author}</b> {chat.createdByUser ? "(You)" : ""}</span>
                </>
                : <FadeLoader/>}
        </div>
        <MessagesContainer chatKey={params.chatKey} chatSocket={chatSocket}/>
        <form className={'chat-footer'} name={'send-message-form'} onSubmit={onSubmit}>
            <MessageInput chatSocket={chatSocket} setFileKeys={setKeys} disable={false} buttonText={"Send message"}/>
        </form>
    </div>
}