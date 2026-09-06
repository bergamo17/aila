import { useState, type FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import logoAila from "@/assets/logo_a_blue.png";

export default function Login() {
  const [, navigate] = useLocation();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("")
    setIsPending(true);

    try {
      await login({ username, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Username atau password salah");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-sm overflow-hidden rounded-2xl border-0 py-0 shadow-xl">
                {/* Gradient header — hanya di dalam card */}
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-10 pb-14 text-center text-white">
                    <img src={logoAila} alt="AILA" className="mx-auto h-16 w-16" />
                    <h1 className="mt-4 text-xl font-semibold tracking-tight">AILA</h1>
                    <p className="mt-1 text-sm text-white/80">Your Study Workspace</p>

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
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
                            disabled={isPending}
                        >
                            {isPending ? "Memproses..." : "Login"}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Belum punya akun?{" "}
                      <Link href="/register" className="font-medium text-blue-600 hover:underline">
                        Daftar sekarang
                      </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
  );
}