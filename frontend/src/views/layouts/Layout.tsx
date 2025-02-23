import {useCallback, useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router";
import {logout} from "../../services/auth.ts";
import useSocket from "../../hooks/useSocket.ts";
import {SocketEvents} from "../../services/sockets.ts";
import {Socket} from "socket.io-client";
import './Layout.css'

function Layout() {
    const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
    const location = useLocation();
    const navigate = useNavigate();
    const beforeConnect = useCallback(() => ({
        listener: (socket: Socket) => socket.on(SocketEvents.OnlineUsers, (usersCount: number) => {
            setOnlineUsersCount(usersCount);
        }),
        cleanup: (socket: Socket) => socket.removeAllListeners(SocketEvents.OnlineUsers),
    }), []);
    useSocket('/', undefined, undefined, beforeConnect);
    const username = location.state?.username;

    useEffect(() => {
        if (!location.state?.loggedIn) {
            navigate("/login");
        }
    }, [navigate, location.state]);

    const logoutHandler = () => {
        logout().then((ok: boolean) => {
            if (ok) {
                navigate("/login");
            }
        });
    };

    return (
        <>
            <div className={'layout-container'}>
                <a href={'/'}><h1 className={'logo'}>chatty</h1></a>
                <div className={'welcome-text'}>
                    <h3>Welcome, {username}!</h3>
                    <h3>{onlineUsersCount} user{onlineUsersCount > 1 ? "s" : ""} online</h3>
                    <button onClick={logoutHandler}>Log out</button>
                </div>
            </div>
            <Outlet/>
        </>
    )
}

export default Layout
