import { create } from "zustand";
import { authApi } from "@/api/auth";
import type { User, CreateUserRequest, LoginUserRequest, RequestToken } from "@/types/auth";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (payload: LoginUserRequest) => Promise<void>;
    register: (payload: CreateUserRequest) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem("access_token"),

    login: async (payload) => {
        const data = await authApi.login(payload);
        set({ user: data.user, isAuthenticated: true});
    },

    register: async (payload) => {
        const data = await authApi.register(payload);
    },

    logout: async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
            await authApi.logout({ refresh_token: refreshToken });
        }
        set({ user: null, isAuthenticated: false });
    },
}));