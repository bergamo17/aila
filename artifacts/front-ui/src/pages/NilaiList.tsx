import React, { useState } from 'react';
import { 
  useListNilai, 
  useCreateNilai, 
  useUpdateNilai, 
  useDeleteNilai,
  useListMahasiswa,
  useListMataKuliah,
  getListNilaiQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreHorizontal, Edit, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

const nilaiSchema = z.object({
  mahasiswaId: z.coerce.number().min(1, 'Mahasiswa is required'),
  mataKuliahId: z.coerce.number().min(1, 'Mata Kuliah is required'),
  nilaiHuruf: z.enum(['A', 'B+', 'B', 'C+', 'C', 'D', 'E'], { required_error: 'Nilai is required' }),
  semester: z.string().min(1, 'Semester is required'),
});

type NilaiFormValues = z.infer<typeof nilaiSchema>;

export default function NilaiList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [studentFilter, setStudentFilter] = useState<string>('all');

  const { data: nilaiData, isLoading } = useListNilai(
    { 
      mahasiswa_id: studentFilter !== 'all' ? Number(studentFilter) : undefined,
      limit: 100 
    },
    { query: { keepPreviousData: true } }
  );

  // Fetch lists for select dropdowns
  const { data: mahasiswaData } = useListMahasiswa({ limit: 500 });
  const { data: mkData } = useListMataKuliah({ limit: 200 });

  const createMutation = useCreateNilai();
  const updateMutation = useUpdateNilai();
  const deleteMutation = useDeleteNilai();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const form = useForm<NilaiFormValues>({
    resolver: zodResolver(nilaiSchema),
    defaultValues: {
      mahasiswaId: 0,
      mataKuliahId: 0,
      nilaiHuruf: 'A',
      semester: 'Ganjil 2024/2025',
    },
  });

  const openCreateForm = () => {
    setEditingId(null);
    form.reset({ 
      mahasiswaId: studentFilter !== 'all' ? Number(studentFilter) : 0, 
      mataKuliahId: 0, 
      nilaiHuruf: 'A', 
      semester: 'Ganjil 2024/2025' 
    });
    setIsFormOpen(true);
  };

  const openEditForm = (item: any) => {
    setEditingId(item.id);
    form.reset({
      mahasiswaId: item.mahasiswaId,
      mataKuliahId: item.mataKuliahId,
      nilaiHuruf: item.nilaiHuruf,
      semester: item.semester,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: NilaiFormValues) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: { nilaiHuruf: values.nilaiHuruf, semester: values.semester } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListNilaiQueryKey() });
            toast({ title: 'Grade updated successfully' });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: 'Update failed', description: error.error || 'Unknown error', variant: 'destructive' });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListNilaiQueryKey() });
            toast({ title: 'Grade submitted successfully' });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: 'Submission failed', description: error.error || 'Unknown error', variant: 'destructive' });
          }
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate(
      { id: deletingId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNilaiQueryKey() });
          toast({ title: 'Grade record deleted' });
          setIsDeleteOpen(false);
          setDeletingId(null);
        },
        onError: (error: any) => {
          toast({ title: 'Delete failed', description: error.error || 'Unknown error', variant: 'destructive' });
        }
      }
    );
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grade Entries</h1>
          <p className="text-muted-foreground text-sm">Input and manage student grades.</p>
        </div>
        <Button onClick={openCreateForm} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Input Nilai
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
          <div className="flex items-center gap-3 w-full max-w-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Filter by Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {mahasiswaData?.data.map((mhs) => (
                  <SelectItem key={mhs.id} value={mhs.id.toString()}>
                    {mhs.nim} - {mhs.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Mahasiswa</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead className="w-[120px]">Semester</TableHead>
              <TableHead className="w-[100px] text-center">Nilai</TableHead>
              <TableHead className="w-[140px]">Date Added</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20 mt-1" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-16 mt-1" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : nilaiData?.data && nilaiData.data.length > 0 ? (
              nilaiData.data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="font-medium text-sm">{item.mahasiswa.nama}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.mahasiswa.nim}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{item.mataKuliah.namaMk}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.mataKuliah.kodeMk} &bull; {item.mataKuliah.sks} SKS</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.semester}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`font-mono text-sm px-2 ${getGradeColor(item.nilaiHuruf)}`}>
                      {item.nilaiHuruf}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForm(item)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                          Edit Grade
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setDeletingId(item.id);
                            setIsDeleteOpen(true);
                          }}
                          className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No grade entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {nilaiData && (
          <div className="p-4 border-t border-border bg-muted/10 text-xs text-muted-foreground flex justify-between">
            <span>Showing {nilaiData.data.length} records</span>
          </div>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Nilai' : 'Input Nilai Baru'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the existing grade.' : 'Record a new grade for a student.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="mahasiswaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mahasiswa</FormLabel>
                    <Select 
                      disabled={!!editingId} 
                      onValueChange={(val) => field.onChange(Number(val))} 
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Mahasiswa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mahasiswaData?.data.map((mhs) => (
                          <SelectItem key={mhs.id} value={mhs.id.toString()}>
                            {mhs.nim} - {mhs.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mataKuliahId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Kuliah</FormLabel>
                    <Select 
                      disabled={!!editingId} 
                      onValueChange={(val) => field.onChange(Number(val))} 
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Mata Kuliah" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mkData?.data.map((mk) => (
                          <SelectItem key={mk.id} value={mk.id.toString()}>
                            {mk.kodeMk} - {mk.namaMk} ({mk.sks} SKS)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nilaiHuruf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai Huruf</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-mono">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A', 'B+', 'B', 'C+', 'C', 'D', 'E'].map((grade) => (
                            <SelectItem key={grade} value={grade} className="font-mono">
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ganjil 2024/2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Grade'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grade Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this grade? It will be removed from the student's transcript permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Record'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
