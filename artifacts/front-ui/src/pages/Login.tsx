import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useLoginAdmin, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [, navigate] = useLocation();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const { mutate: login, isPending, error } = useLoginAdmin ({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: getGetAdminMeQueryKey()});
                navigate("/");
            },
        },
    });


    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        login({data: { email, password }});
    }


    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm overflow-hidden rounded-2xl border-0 py-0 shadow-xl">
        {/* Gradient header — hanya di dalam card */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-10 pb-14 text-center text-white">
          <GraduationCap className="mx-auto h-12 w-12" strokeWidth={1.5} />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Sistem Akademik
          </h1>
          <p className="mt-1 text-sm text-white/80">Portal khusus admin</p>

          <svg
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 h-10 w-full text-slate-50"
            fill="currentColor"
          >
            <path d="M0,20 C100,40 300,0 400,20 L400,40 L0,40 Z" />
          </svg>
        </div>

        {/* Form */}
        <CardContent className="px-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sistemakademik.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">
                Email atau password salah.
              </p>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    );
}