import {useCallback, useEffect, useState} from "react";
import ChatCardComponent from "../components/ChatCard";
import {getRandomChats, joinChat} from "../services/chats.ts";
import {useLocation, useNavigate} from "react-router";
import {ChatCardData} from "../models";
import "./Search.css";

export default function Search() {
    const navigate = useNavigate();
    const location = useLocation();
    const [chats, setChats] = useState<ChatCardData[]>([]);

    const getChats = useCallback(() =>
        getRandomChats().then((chats) => {
            if (chats !== null) {
                setChats(chats.map((chat) => ({...chat, joined: false})));
            }
        }), []);

    useEffect(() => {
        getChats();
    }, [getChats]);

    const onChatJoin = (chatIndex: number, chatKey: string) => () => {
        joinChat(chatKey).then((isOk) => {
            if (isOk) {
                setChats((prevState) => {
                    const newState = [...prevState];
                    newState[chatIndex].joined = true;
                    return newState;
                });
            }
        });
    };

    const onClick = (chatKey: string) => () => {
        navigate('/chats/' + chatKey, {state: location.state});
    };

    return <>
        <button onClick={getChats}>Shuffle!</button>
        <div id={"search-container"} className={"search-container"}>
            {chats.length > 0 ? chats.map((chat: ChatCardData, index: number) =>
                    <ChatCardComponent
                        chatTitle={chat.title}
                        key={chat.key}
                        joined={chat.joined}
                        onJoin={onChatJoin(index, chat.key)}
                        onClick={chat.joined ? onClick(chat.key) : undefined}/>) :
                <span style={{color: "white"}}>No new chats found.</span>}
        </div>
    </>
}