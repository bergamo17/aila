import React, { useState } from 'react';
import { 
  useListMataKuliah, 
  useCreateMataKuliah, 
  useUpdateMataKuliah, 
  useDeleteMataKuliah,
  getListMataKuliahQueryKey
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, BookOpen } from 'lucide-react';
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

const mataKuliahSchema = z.object({
  kodeMk: z.string().min(1, 'Kode MK is required'),
  namaMk: z.string().min(1, 'Nama MK is required'),
  sks: z.coerce.number().min(1, 'SKS must be at least 1').max(6, 'SKS cannot exceed 6'),
  dosenPengampu: z.string().optional().or(z.literal('')),
});

type MataKuliahFormValues = z.infer<typeof mataKuliahSchema>;

export default function MataKuliahList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data, isLoading } = useListMataKuliah({ limit: 100 }, { query: { keepPreviousData: true } });

  // Filter client-side since API might not have search param for mata kuliah
  const filteredData = data?.data.filter(mk => 
    mk.kodeMk.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mk.namaMk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mk.dosenPengampu && mk.dosenPengampu.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const createMutation = useCreateMataKuliah();
  const updateMutation = useUpdateMataKuliah();
  const deleteMutation = useDeleteMataKuliah();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const form = useForm<MataKuliahFormValues>({
    resolver: zodResolver(mataKuliahSchema),
    defaultValues: {
      kodeMk: '',
      namaMk: '',
      sks: 3,
      dosenPengampu: '',
    },
  });

  const openCreateForm = () => {
    setEditingId(null);
    form.reset({ kodeMk: '', namaMk: '', sks: 3, dosenPengampu: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (mk: any) => {
    setEditingId(mk.id);
    form.reset({
      kodeMk: mk.kodeMk,
      namaMk: mk.namaMk,
      sks: mk.sks,
      dosenPengampu: mk.dosenPengampu || '',
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: MataKuliahFormValues) => {
    const payload = {
      ...values,
      dosenPengampu: values.dosenPengampu || null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMataKuliahQueryKey() });
            toast({ title: 'Course updated successfully' });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: 'Update failed', description: error.error || 'Unknown error', variant: 'destructive' });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMataKuliahQueryKey() });
            toast({ title: 'Course created successfully' });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: 'Creation failed', description: error.error || 'Unknown error', variant: 'destructive' });
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
          queryClient.invalidateQueries({ queryKey: getListMataKuliahQueryKey() });
          toast({ title: 'Course deleted successfully' });
          setIsDeleteOpen(false);
          setDeletingId(null);
        },
        onError: (error: any) => {
          toast({ title: 'Delete failed', description: error.error || 'Unknown error', variant: 'destructive' });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Katalog Mata Kuliah</h1>
          <p className="text-muted-foreground text-sm">Manage curriculum courses and credits.</p>
        </div>
        <Button onClick={openCreateForm} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Mata Kuliah
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              className="pl-9 h-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[120px] font-mono text-xs">KODE MK</TableHead>
              <TableHead>Nama Mata Kuliah</TableHead>
              <TableHead className="w-[100px] text-center">SKS</TableHead>
              <TableHead>Dosen Pengampu</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((mk) => (
                <TableRow key={mk.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs font-medium text-primary">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{mk.kodeMk}</Badge>
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    {mk.namaMk}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {mk.sks}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mk.dosenPengampu || '-'}
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
                        <DropdownMenuItem onClick={() => openEditForm(mk)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setDeletingId(mk.id);
                            setIsDeleteOpen(true);
                          }}
                          className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data && (
          <div className="p-4 border-t border-border bg-muted/10 text-xs text-muted-foreground flex justify-between">
            <span>Showing {filteredData.length} courses</span>
          </div>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the course details.' : 'Enter new course information.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="kodeMk"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Kode MK</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TIF101" {...field} className="font-mono uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sks"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>SKS</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={6} {...field} className="font-mono text-center" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="namaMk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Mata Kuliah</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Algoritma Pemrograman" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dosenPengampu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosen Pengampu (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dr. Rina Kusuma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Course'}
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
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Deleting this course may affect students who have already received grades for it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
