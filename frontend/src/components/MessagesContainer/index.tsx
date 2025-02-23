import {Socket} from "socket.io-client";
import {createRef, UIEventHandler, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {SocketEvents} from "../../services/sockets.ts";
import {Message} from "../../models";
import MessageComponent from "../Message";
import {FadeLoader} from "react-spinners";
import {getMessagesForChat} from "../../services/messages.ts";
import "./index.css";

type MessagesContainerProps = {
    chatKey?: string;
    chatSocket: Socket;
}

export default function MessagesContainer({chatSocket, chatKey}: MessagesContainerProps) {
    const [messagePage, setMessagePage] = useState<number>(0);
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [usersTyping, setUsersTyping] = useState<string[]>([]);
    const messagesHistoryOffsetRef = useRef<number>(0);
    const messagePageOffsetRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null);
    const messageContainerInitialScrollRef = useRef<boolean>(true);
    const stopFetchRef = useRef<boolean>(false);
    const messageContainerRef = createRef<HTMLDivElement>();

    const getUsersTypingString = useCallback(() => {
        const usersTypingCount = usersTyping.length;
        if (usersTypingCount === 1) {
            return `${usersTyping[0]} is typing...`;
        }
        if (usersTypingCount === 2) {
            return `${usersTyping[0]} and ${usersTyping[1]} are typing...`;
        }
        if (usersTypingCount === 3) {
            return `${usersTyping[0]}, ${usersTyping[1]} and ${usersTyping[2]} are typing...`;
        }
        if (usersTypingCount > 3) {
            const rest = usersTypingCount - 3;
            return `${usersTyping[0]}, ${usersTyping[1]}, ${usersTyping[2]} and ${rest} other user${rest > 1 ? "s" : ""} are typing...`;
        }
    }, [usersTyping]);

    const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
        if (!stopFetchRef.current && messagePageOffsetRef.current === null && e.currentTarget.scrollTop === 0) {
            messagePageOffsetRef.current = {
                scrollHeight: e.currentTarget.scrollHeight,
                scrollTop: e.currentTarget.scrollTop,
            };
            setMessagePage(prevState => prevState + 1);
        }
    }

    useEffect(() => {
        if (chatKey) {
            getMessagesForChat(chatKey, messagePage).then(messages => {
                if (messages !== null && messages.length > 0) {
                    setMessages((prevState) => {
                        const newState = prevState !== null ? prevState.slice() : [];

                        newState.unshift(...messages);

                        messagesHistoryOffsetRef.current = newState.length;

                        return newState;
                    });
                } else {
                    stopFetchRef.current = true;
                }
            });
        }
    }, [chatKey, messagePage]);

    useLayoutEffect(() => {
        if (messages && messages.length > 0) {
            console.log("scrolling by ", messageContainerRef.current!.scrollHeight);
            messageContainerRef.current?.scrollBy({ top: messageContainerRef.current.scrollHeight });
            messageContainerInitialScrollRef.current = false;
        }

        if (messagePageOffsetRef.current) {
            if (messageContainerRef.current) {
                messageContainerRef.current.scrollTop = messageContainerRef.current.clientHeight + (messageContainerRef.current.scrollHeight - messagePageOffsetRef.current.scrollHeight);
            }
            messagePageOffsetRef.current = null;
        }
    }, [messages]);

    useEffect(() => {
        chatSocket.on(SocketEvents.Message.Send, (message: Message) => {
            setMessages((prevState) => {
                const newState = prevState !== null ? prevState.slice() : [];
                const sortedArray = newState.slice(0, messagesHistoryOffsetRef.current);
                const unsortedArray = newState.slice(messagesHistoryOffsetRef.current);

                unsortedArray.push(message);
                unsortedArray.sort((first, second) => first.createdAt - second.createdAt);

                return sortedArray.concat(unsortedArray);
            });
        });
        chatSocket.on(SocketEvents.Typing.Start, (username: string) => {
            setUsersTyping(prevState => {
                const newState = prevState.slice();
                if (newState.findIndex(usersTyping => usersTyping === username) === -1) {
                    newState.push(username);
                }
                return newState;
            });
        });
        chatSocket.on(SocketEvents.Typing.Finish, (username: string) => {
            setUsersTyping(prevState => {
                const newState = prevState.slice();
                const indexFound = newState.findIndex(userTyping => userTyping === username);

                if (indexFound > -1) {
                    newState.splice(indexFound, 1);
                }

                return newState;
            });
        });
    }, [chatSocket]);

    return <div className={'chat-messages-container'} ref={messageContainerRef} onScroll={onScroll}>
        {messages !== null ?
            (messages.length > 0 ?
                messages.map((message, index) =>
                    <MessageComponent key={index}
                                      mediaKeys={message.mediaKeys}
                                      text={message.text}
                                      author={message.username}
                                      createdAt={message.createdAt}
                                      sentByUser={message.sentByUser}
                                      updatedAt={message.updatedAt}/>) :
                <span>There are no messages in this chat yet.</span>) :
            <FadeLoader/>}
        {usersTyping.length > 0 ? <div className={'users-typing'}>{getUsersTypingString()}</div> : null}
    </div>
}