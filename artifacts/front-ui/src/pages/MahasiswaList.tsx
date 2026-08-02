import React, { useState } from 'react';
import { 
  useListMahasiswa, 
  useCreateMahasiswa, 
  useUpdateMahasiswa, 
  useDeleteMahasiswa,
  getListMahasiswaQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, MoreHorizontal, FileText, Edit, Trash2 } from 'lucide-react';
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

const mahasiswaSchema = z.object({
  nim: z.string().min(1, 'NIM is required'),
  nama: z.string().min(1, 'Nama is required'),
  jurusan: z.string().min(1, 'Jurusan is required'),
  angkatan: z.coerce.number().min(1900, 'Invalid year').max(2100, 'Invalid year'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type MahasiswaFormValues = z.infer<typeof mahasiswaSchema>;

export default function MahasiswaList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  // Use a simple debounce for search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useListMahasiswa(
    { search: debouncedSearch || undefined, limit: 100 },
    { query: { keepPreviousData: true } }
  );

  const createMutation = useCreateMahasiswa();
  const updateMutation = useUpdateMahasiswa();
  const deleteMutation = useDeleteMahasiswa();

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete Alert State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const form = useForm<MahasiswaFormValues>({
    resolver: zodResolver(mahasiswaSchema),
    defaultValues: {
      nim: '',
      nama: '',
      jurusan: '',
      angkatan: new Date().getFullYear(),
      email: '',
    },
  });

  const openCreateForm = () => {
    setEditingId(null);
    form.reset({
      nim: '',
      nama: '',
      jurusan: '',
      angkatan: new Date().getFullYear(),
      email: '',
    });
    setIsFormOpen(true);
  };

  const openEditForm = (mhs: any) => {
    setEditingId(mhs.id);
    form.reset({
      nim: mhs.nim,
      nama: mhs.nama,
      jurusan: mhs.jurusan,
      angkatan: mhs.angkatan,
      email: mhs.email || '',
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: MahasiswaFormValues) => {
    const payload = {
      ...values,
      email: values.email || null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMahasiswaQueryKey() });
            toast({ title: 'Student updated successfully' });
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
            queryClient.invalidateQueries({ queryKey: getListMahasiswaQueryKey() });
            toast({ title: 'Student created successfully' });
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
          queryClient.invalidateQueries({ queryKey: getListMahasiswaQueryKey() });
          toast({ title: 'Student deleted successfully' });
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
          <h1 className="text-2xl font-bold tracking-tight">Mahasiswa Directory</h1>
          <p className="text-muted-foreground text-sm">Manage student records and information.</p>
        </div>
        <Button onClick={openCreateForm} className="shrink-0" data-testid="button-tambah-mahasiswa">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Mahasiswa
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by NIM, Nama, or Jurusan..."
              className="pl-9 h-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-mahasiswa"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[120px] font-mono text-xs">NIM</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead className="w-[100px] text-center">Angkatan</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((mhs) => (
                <TableRow key={mhs.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs">{mhs.nim}</TableCell>
                  <TableCell className="font-medium">{mhs.nama}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-background">
                      {mhs.jurusan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {mhs.angkatan}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {mhs.email || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem asChild>
                          <Link href={`/mahasiswa/${mhs.id}/transkrip`} className="cursor-pointer flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            Transkrip Nilai
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditForm(mhs)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setDeletingId(mhs.id);
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
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data && (
          <div className="p-4 border-t border-border bg-muted/10 text-xs text-muted-foreground flex justify-between">
            <span>Showing {data.data.length} of {data.total} records</span>
          </div>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the student record details.' : 'Enter new student information into the system.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="nim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIM</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 12345678" {...field} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Budi Santoso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jurusan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurusan</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Teknik Informatika" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="angkatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Angkatan</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="budi@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Record'}
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student record
              and potentially all their associated grades and transcripts.
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
