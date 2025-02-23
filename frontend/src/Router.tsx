import {BrowserRouter, Route, Routes} from "react-router";
import Layout from "./views/layouts/Layout.tsx";
import Auth from "./views/Auth.tsx";
import Home from "./views/Home.tsx";
import Search from "./views/Search.tsx";
import LayoutWithBackButton from "./views/layouts/LayoutWithBackButton.tsx";
import MyChats from "./views/MyChats.tsx";
import Chat from "./views/Chat.tsx";
import AddChat from "./views/AddChat.tsx";

export default function Router() {
    return <BrowserRouter>
        <Routes>
            <Route path={"/"} element={<Layout/>}>
                <Route path={"/"} element={<Home/>}/>
                <Route path={"/"} element={<LayoutWithBackButton/>}>
                    <Route path={"/find-new-chats"} element={<Search/>}/>
                    <Route path={"/my-chats"} element={<MyChats/>}/>
                    <Route path={"/chats/:chatKey"} element={<Chat/>}/>
                    <Route path={"/add-chat"} element={<AddChat/>}/>
                </Route>
            </Route>
            <Route path={"/login"} element={<Auth/>}/>
            <Route path={"/signup"} element={<Auth isSignup={true}/>}/>
        </Routes>
    </BrowserRouter>
}