import {Outlet, useNavigate} from "react-router";
import './Layout.css'

function LayoutWithBackButton() {
    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    return (
        <>
            <button onClick={onBack} style={{margin: 30}}>
                Go back
            </button>
            <Outlet/>
        </>
    )
}

export default LayoutWithBackButton;
