import { authApi } from "@/api/auth";
import { API_BASE_URL } from "@/config/api.config";

interface ApiOptions extends RequestInit {
    requireAuth?: boolean;
}

async function refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        throw new Error("No refresh token found");
    }

    try {
        const data = await authApi.renewSession({ refresh_token: refreshToken });
        return data.access_token;
    } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        throw err;
    }
}

async function apiFetch(path: string, options: ApiOptions = {}) {
    const { requireAuth = true, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(fetchOptions.headers as Record<string, string>),
    };

    if (requireAuth) {
        const token = localStorage.getItem("access_token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    let res = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers,
    });

    if (res.status === 401 && requireAuth) {
        const newToken = await refreshAccessToken();
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers });
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Request failed ${res.status}`);
    }

    return res.json();

}

export default apiFetch;