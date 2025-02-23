import {FormEvent} from "react";

type FetchOptions = {
    pathParam?: string,
    pageNumber?: number,
} & RequestInit;

export const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL!;

export const fetchWrapper = (route: string, {pathParam, pageNumber, ...rest}: FetchOptions = {}) => {
    let url = BASE_URL + route;
    if (pathParam) {
        url += pathParam;
    }
    const urlObject = new URL(url);

    if (pageNumber !== undefined) {
        urlObject.searchParams.append('pageOffset', pageNumber.toString());
    }

    return fetch(urlObject, {
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        ...rest
    });
}

export const getFormData = (e: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.target as HTMLFormElement);

    const strings: { [key: string]: string } = {};
    const files: { [key: string]: File } = {};

    for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
            strings[key] = value;
        } else {
            files[key] = value;
        }
    }

    return {strings, files};
}