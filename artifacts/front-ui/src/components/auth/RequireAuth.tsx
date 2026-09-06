import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/auth-store";

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const [, navigate] = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const { data: user, isLoading, isError } = useQuery ({
        queryKey: ["me"],
        queryFn: userApi.getMe,
        enabled: isAuthenticated,
        retry: false,
    });

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-6 w-6" />
            </div>
        );
    }

    if (isError || !user) {
        navigate("/login");
        return null;
    }

    return <>{children}</>;
}