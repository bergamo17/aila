import React from 'react';
import { useParams, Link } from 'wouter';
import { useGetMahasiswaTranskrip } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MahasiswaTranskrip() {
  const { id } = useParams();
  const mahasiswaId = Number(id);

  const { data: transkrip, isLoading, isError } = useGetMahasiswaTranskrip(
    mahasiswaId,
    { query: { enabled: !isNaN(mahasiswaId) } }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !transkrip) {
    return (
      <div className="p-6 border border-destructive/20 bg-destructive/10 text-destructive rounded-md text-sm">
        Failed to load transcript. Make sure the student exists.
        <div className="mt-4">
          <Link href="/mahasiswa">
            <Button variant="outline" size="sm">Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { mahasiswa, nilai, totalSks, ipk } = transkrip;

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      'B+': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      'B': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      'C+': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      'C': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      'D': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
      'E': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    };
    return colors[grade] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link href="/mahasiswa">
          <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex">
          <Printer className="h-4 w-4 mr-2" />
          Print Transcript
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-muted/30 p-6 sm:p-8 border-b border-border relative overflow-hidden">
          {/* Decorative watermark */}
          <FileText className="absolute -right-8 -bottom-12 h-48 w-48 text-muted/20 rotate-12 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-2">
              <h1 className="text-2xl font-bold tracking-tight">{mahasiswa.nama}</h1>
              <p className="text-muted-foreground text-sm mt-1">{mahasiswa.email || 'No email registered'}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">NIM</p>
                <p className="font-mono font-medium">{mahasiswa.nim}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Jurusan</p>
                <p className="font-medium">{mahasiswa.jurusan}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Angkatan</p>
                <p className="font-mono font-medium">{mahasiswa.angkatan}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Status</p>
                <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">Aktif</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-card">
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total SKS</p>
            <p className="text-3xl font-mono font-bold text-primary">{totalSks}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">IPK (GPA)</p>
            <p className="text-3xl font-mono font-bold text-primary">{ipk.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="w-[100px] font-mono text-xs">KODE</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead className="text-center w-[120px]">Semester</TableHead>
                <TableHead className="text-center w-[80px]">SKS</TableHead>
                <TableHead className="text-center w-[100px]">Nilai</TableHead>
                <TableHead className="text-right w-[100px]">Bobot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nilai.length > 0 ? (
                nilai.map((item, i) => (
                  <TableRow key={item.nilaiId} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.mataKuliah.kodeMk}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.mataKuliah.namaMk}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {item.semester}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {item.mataKuliah.sks}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`font-mono text-xs px-2 rounded-sm ${getGradeColor(item.nilaiHuruf)}`}>
                        {item.nilaiHuruf}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {(item.bobotNilai * item.mataKuliah.sks).toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No academic records found for this student.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
