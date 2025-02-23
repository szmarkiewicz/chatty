import {useEffect, useMemo} from "react";
import {socketManager} from "../services/sockets.ts";
import {Socket} from "socket.io-client";

export type SocketCallback = () => { listener: (socket: Socket) => void, cleanup: (socket: Socket) => void };

function useSocket(namespace: string, onConnect?: SocketCallback, onDisconnect?: SocketCallback, beforeConnect?: SocketCallback) {
    const socket = useMemo(() => socketManager.socket(namespace), [namespace]);

    useEffect(() => {
        beforeConnect?.().listener(socket);
        socket.on("connect", () => {
            onConnect?.().listener(socket);
        });
        socket.on("disconnect", () => {
            onDisconnect?.().listener(socket);
        });
        socket.connect();

        return () => {
            beforeConnect?.().cleanup(socket);
            onConnect?.().cleanup(socket);
            onDisconnect?.().cleanup(socket);
            socket.removeAllListeners("connect");
            socket.removeAllListeners("disconnect");
            socket.disconnect();
        }
    }, [socket, onConnect, onDisconnect, beforeConnect]);

    return socket;
}

export default useSocket;