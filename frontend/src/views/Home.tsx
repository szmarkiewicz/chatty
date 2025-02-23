import CircularButton from "../components/CircularButton";
import PlusSvg from '../assets/plus.svg';
import DiceSvg from '../assets/dice.svg';
import ListSvg from '../assets/list.svg';
import {useLocation, useNavigate} from "react-router";
import './Home.css'

function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={'nav-container'}>
            <CircularButton svgUrl={ListSvg} onClick={() => navigate('/my-chats', {state: location.state})}
                            radius={200}/>
            <CircularButton svgUrl={PlusSvg} onClick={() => navigate('/add-chat', {state: location.state})}
                            radius={200}/>
            <CircularButton svgUrl={DiceSvg} onClick={() => navigate('/find-new-chats', {state: location.state})}
                            radius={200}/>
        </div>
    )
}

export default Home;
