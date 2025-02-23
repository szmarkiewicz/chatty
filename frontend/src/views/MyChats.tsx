import {useEffect, useState} from "react";
import ChatCardComponent from "../components/ChatCard";
import {getMyChats} from "../services/chats.ts";
import {useLocation, useNavigate} from "react-router";
import {ChatCardData} from "../models";
import "./Search.css";

export default function MyChats() {
    const navigate = useNavigate();
    const location = useLocation();
    const [chats, setChats] = useState<ChatCardData[]>([]);
    const [chatsPage, setChatsPage] = useState<number>(0);
    const [isMoreAvailable, setIsMoreAvailable] = useState<boolean>(false);

    useEffect(() => {
        getMyChats(chatsPage).then((response) => {
            if (response !== null) {
                if (response.chats.length > 0) {
                    setChats((prevState) => prevState.concat(response.chats.map((chat) => ({...chat, joined: true}))));
                }
                setIsMoreAvailable(response.moreAvailable);
            }
        });
    }, [chatsPage]);

    const onClick = (chatKey: string) => () => {
        navigate('/chats/' + chatKey, {state: location.state});
    };

    const onLoadMore = () => {
        setChatsPage((prevState) => prevState + 1);
    }

    return <div id={"search-container"} className={"search-container"}>
        {chats.length > 0 ? chats.map((chat: ChatCardData) => <ChatCardComponent chatTitle={chat.title}
                                                                                 key={chat.key}
                                                                                 joined={chat.joined}
                                                                                 onClick={onClick(chat.key)}/>) :
            <span style={{color: "white"}}>No chats joined.</span>}
        {isMoreAvailable ? <button onClick={onLoadMore}>Load more</button> : null}
    </div>
}