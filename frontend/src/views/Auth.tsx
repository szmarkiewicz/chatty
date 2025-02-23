import {FormEvent, useState} from "react";
import {login, signup} from "../services/auth.ts";
import {useNavigate} from "react-router";
import {getFormData} from "../services/utils.ts";
import "./Auth.css";

export type AuthorizationProps = {
    isSignup?: boolean;
}

export default function Auth({isSignup = false}: AuthorizationProps) {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onLogin = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const {strings} = getFormData(e);

        if (!strings['username'] || !strings['password']) {
            setErrorMessage("Enter nonempty username and password");
            return;
        }

        login({
            username: strings['username'],
            password: strings['password'],
        }).then((response) => {
            if (response.status === 404 || response.status === 401) {
                setErrorMessage("Invalid credentials.");
            } else if (response.loggedIn) {
                navigate('/', {state: {username: response.username, loggedIn: response.loggedIn}});
            }
        }).catch(() => {
            setErrorMessage("Unexpected error occurred. Try again later.");
        });
    };

    const onSignup = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const {strings} = getFormData(e);

        const data = {
            username: strings['username'],
            password: strings['password'],
        };

        if (!data.password || !data.username) {
            setErrorMessage("Enter nonempty username and password");
            return;
        }

        signup(data).then((response) => {
            if (response.ok) {
                login(data).then((response) => {
                    navigate('/', {state: {username: response.username, loggedIn: response.loggedIn}});
                });
            } else if (response.status === 409) {
                setErrorMessage("Username already taken. Choose something else.");
            }
        }).catch(() => {
            setErrorMessage("Unexpected error occurred. Try again later.");
        });
    };

    const onChange = () => {
        setErrorMessage(null);
    }

    return <>
        <h1 style={{color: "white"}}>chatty</h1>
        <div className={"auth-container"}>
            <h3>{isSignup ? "Sign Up" : "Log In"}</h3>
            <form id={"login-form"} className={"login-form"} onSubmit={isSignup ? onSignup : onLogin}>
                <input type={'text'} id={'username'} name={'username'} className={"login-input text-input"}
                       onChange={onChange}/>
                <input type={'password'} id={'password'} name={'password'} className={"login-input text-input"}
                       onChange={onChange}/>
                <span style={{color: "orangered"}}>{errorMessage}</span>
                <button type={"submit"}>{isSignup ? "Sign up" : "Log in"}</button>
            </form>
            {isSignup ? null : <a href={'/signup'}>Don't have an account? Sign up</a>}
        </div>
    </>
}