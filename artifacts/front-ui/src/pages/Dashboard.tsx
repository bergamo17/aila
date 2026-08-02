import React from 'react';
import { useGetDashboardStats } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Users, BookOpen, GraduationCap } from 'lucide-react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-6 border border-destructive/20 bg-destructive/10 text-destructive rounded-md text-sm">
        Failed to load dashboard statistics.
      </div>
    );
  }

  // Map grade colors for the chart
  const gradeColors: Record<string, string> = {
    'A': 'hsl(142 71% 45%)', // green
    'B+': 'hsl(217 91% 60%)', // blue
    'B': 'hsl(217 91% 60%)', // blue
    'C+': 'hsl(48 96% 53%)', // yellow
    'C': 'hsl(48 96% 53%)', // yellow
    'D': 'hsl(24 98% 50%)', // orange
    'E': 'hsl(0 84% 60%)', // red
  };

  const chartData = stats.distribusiNilai.map(item => ({
    name: item.nilaiHuruf,
    jumlah: item.jumlah,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Academic Overview</h1>
        <p className="text-muted-foreground text-sm">System statistics and recent activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mahasiswa</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.totalMahasiswa.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mata Kuliah</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.totalMataKuliah.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Nilai Entries</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.totalNilai.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      fontSize: '12px',
                      borderRadius: '6px'
                    }} 
                  />
                  <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={gradeColors[entry.name] || 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No grades available to display.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
            <Link href="/mahasiswa">
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {stats.mahasiswaTerbaru.length > 0 ? (
              <div className="space-y-4">
                {stats.mahasiswaTerbaru.map((mhs) => (
                  <div key={mhs.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium truncate">{mhs.nama}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-mono">
                        <span>{mhs.nim}</span>
                        <span>&bull;</span>
                        <span className="truncate">{mhs.jurusan}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                      {mhs.angkatan}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground pb-8">
                No students added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
