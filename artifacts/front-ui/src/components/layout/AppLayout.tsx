import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  NotebookText,
  ListTodo
} from 'lucide-react';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { CalendarDays } from 'lucide-react';

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
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col">
        <div className="h-14 flex items-center px-6 border-b border-border bg-card">
          <h1 className="font-heading font-bold text-lg tracking-tight text-primary">AILA</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground font-mono">
            V. 1.0.0-PROD
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-grid-pattern relative">
          <div className="absolute inset-0 bg-background/50 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
