import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  NotebookText,
  ListTodo,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  LogOut, 
  User
} from 'lucide-react';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { useAuthStore } from '@/lib/auth-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Workspace', href: '/workspace', icon: NotebookText },
  { name: 'Schedule', href: '/schedule', icon: CalendarDays },
  { name: 'Task', href:'/tasks', icon: ListTodo },
  { name: 'Mahasiswa', href: '/mahasiswa', icon: Users, flag: 'ENABLE_MAHASISWA_MENU' as const },
  { name: 'Mata Kuliah', href: '/mata-kuliah', icon: BookOpen, flag: 'ENABLE_MATA_KULIAH_MENU' as const },
  { name: 'Nilai', href: '/nilai', icon: GraduationCap, flag: 'ENABLE_NILAI_MENU' as const },
].filter((item) => !item.flag || FEATURE_FLAGS[item.flag]);

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }
  
  const initial = user?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-card border-r border-border transition-[width] duration-200 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <h1 className="font-heading font-bold text-lg tracking-tight text-primary truncate">
              AILA
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="ml-auto p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
            title={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground font-mono">
            V. 1.0.0-PROD
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Top bar — cuma berisi avatar dropdown di kanan */}
        <header className="h-14 flex items-center justify-end px-6 border-b border-border bg-card shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center rounded-full h-8 w-8 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                {initial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-grid-pattern relative">
          <div className="absolute inset-0 bg-background/50 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
