import MessageInput from "../components/MessageInput";
import {FormEvent, useRef, useState} from "react";
import {getFormData} from "../services/utils.ts";
import {createChat} from "../services/chats.ts";
import {useLocation, useNavigate} from "react-router";
import "./AddChat.css";

export default function AddChat() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileKeys = useRef<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const {strings} = getFormData(e);

        if (!strings['title'] || !strings['message-text']) {
            setErrorMessage("Title and text message must be non-empty.");
        }

        createChat({
            title: strings['title'],
            mediaKeys: fileKeys.current,
            text: strings['message-text'],
        }).then(chatKey => {
            if (chatKey !== null) {
                navigate(`/chats/${chatKey}`, {state: location.state});
            }
        });
    };

    const setKeys = (keys: string[]) => {
        fileKeys.current = keys;
    }

    const onChange = () => {
        setErrorMessage(null);
    }

    return <div className={'add-chat-container'}>
        <form id={'add-chat-form'} name={'add-chat-form'} className={'add-chat-form'} onSubmit={onSubmit}>
            <div className={'add-chat-section'}>
                <span className={'label-text'}>Chat Title</span>
                <input type={'text'} className={'text-input'} name={'title'} onChange={onChange}/>
            </div>
            <div className={'add-chat-section'}>
                <span className={'label-text'}>Text</span>
                <MessageInput setFileKeys={setKeys} disable={false} buttonText={"Create chat"} onTextChange={onChange}/>
            </div>
            <span style={{color: "orangered"}}>{errorMessage}</span>
        </form>
    </div>
}