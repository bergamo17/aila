import apiFetch from "@/lib/api";
import type { User, CreateUserRequest, LoginUserRequest, LoginUserResponse, RequestToken, RenewSessionResponse } from "@/types/auth";
import { X } from "lucide-react";

export const authApi = {
    register: async (payload: CreateUserRequest): Promise<User> => {
        return await apiFetch("/user/create", {
            method: "POST",
            requireAuth: false,
            body: JSON.stringify(payload),
        });
    },
    login: async (payload: LoginUserRequest): Promise<LoginUserResponse> => {
        const data: LoginUserResponse = await apiFetch("/user/login", {
            method:"POST",
            requireAuth: false,
            body: JSON.stringify(payload),
        });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        return data;
    },
    renewSession: async (payload: RequestToken): Promise<RenewSessionResponse> => {
        const data: RenewSessionResponse = await apiFetch("/token/renew", {
            method: "POST",
            requireAuth: false,
            body: JSON.stringify(payload),
        });
        localStorage.setItem("access_token", data.access_token);
        return data;
    },
    logout: async (payload: RequestToken): Promise<void> => {
        try{
            await apiFetch("/user/logout", {
                method: "POST",
                body: JSON.stringify(payload),
            });
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
    },
}