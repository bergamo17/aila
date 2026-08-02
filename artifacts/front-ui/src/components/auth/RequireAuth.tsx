import { type ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { Spinner } from "@/components/ui/spinner";

export function RequireAuth({ children}: { children: ReactNode }) {
    const [, navigate] = useLocation()
    const { data: admin, isLoading, isError } = useGetAdminMe({
        query: {
            retry: false,
        },
    });

    useEffect(() => {
        if (!isLoading && (isError || !admin)) {
            navigate("/login");
        }
    }, [isLoading, isError, admin, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-6 w-6" />
            </div>
        );
    }
    
    if (isError || !admin) {
        return null;
    }

    return <>{children}</>
}