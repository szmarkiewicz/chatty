import "./index.css";

interface CircularButtonProps {
    svgUrl: string;
    onClick: () => void;
    radius?: number
}

export default function CircularButton({svgUrl, onClick, radius = 50}: CircularButtonProps) {
    return <button style={{width: radius, height: radius}} className={"circular-button"} onClick={onClick}>
        <img src={svgUrl} alt={'Circular Button'} width={radius*0.6} height={radius*0.6} className="svg-image" />
    </button>;
};