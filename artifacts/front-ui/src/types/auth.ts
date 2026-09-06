import { string } from "zod";

export interface User {
    username: string;
    fullname: string;
    email: string;
    password_changed_at: string;
    created_at: string;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    fullname: string;
    email: string;
}

export interface LoginUserRequest {
    username: string;
    password: string;
}

export interface LoginUserResponse {
    session_id: string;
    access_token: string;
    access_token_expired_at: string;
    refresh_token: string;
    refresh_token_expired_at: string;
    user: User;
}

export interface RequestToken {
    refresh_token: string;
}

export interface RenewSessionResponse {
    access_token: string;
    expired_at: string;
}