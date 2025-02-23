import ArrowRightSvg from '../../assets/arrow_right.svg';
import "./index.css";

interface ChatCardProps {
    chatTitle: string;
    joined: boolean;
    onJoin?: () => void;
    onClick?: () => void;
}

export default function ChatCard({chatTitle, joined, onJoin, onClick}: ChatCardProps) {
    return <div className={`chat-card ${joined ? ' joined' : ''}`} onClick={onClick}>
        <span className={"chat-title"}>{chatTitle}</span>
        {joined ? <img src={ArrowRightSvg} alt={'Chat Card'} className="svg-image chat-element chat-arrow" /> :
            <button onClick={onJoin} className={'chat-button chat-element'}>Join</button>}
    </div>;
};