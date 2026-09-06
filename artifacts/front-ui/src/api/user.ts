import apiFetch from "@/lib/api";
import type { User } from "@/types/auth";

export const userApi = {
    getMe: (): Promise<User> => 
        apiFetch("/user/me", {
            method: "GET",
        }),
};