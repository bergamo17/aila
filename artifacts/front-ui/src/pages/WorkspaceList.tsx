import React, { useState } from 'react';
import { Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useListSubjects, useCreateSubject } from '@/hooks/use-subject';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Edit, Trash2, NotebookText, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const subjectSchema = z.object({
  name: z.string().min(1, 'Nama subject wajib diisi'),
  color: z.string().min(1),
});
type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function WorkspaceList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useListSubjects();
  const createMutation = useCreateSubject();
  // const updateMutation = useUpdateSubject();
  // const deleteMutation = useDeleteSubject();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '', color: COLORS[0] },
  });

  const filtered = data?.filter((s) =>
    s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()),
  ) ?? [];

  const openCreateForm = () => {
    setEditingId(null);
    form.reset({ name: '', color: COLORS[0] });
    setIsFormOpen(true);
  };

  const openEditForm = (subject: { id: string; name: string; color: string }) => {
    setEditingId(subject.id);
    form.reset({ name: subject.name, color: subject.color });
    setIsFormOpen(true);
  };

  const onSubmit = (values: SubjectFormValues) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: values },
        {
          onSuccess: () => {
            toast({ title: 'Subject berhasil diperbarui' });
            setIsFormOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast({ title: 'Subject berhasil dibuat' });
            setIsFormOpen(false);
          },
        },
      );
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate(
      { id: deletingId },
      {
        onSuccess: () => {
          toast({ title: 'Subject dihapus' });
          setIsDeleteOpen(false);
          setDeletingId(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Workspace</h1>
          <p className="text-muted-foreground text-sm">Kelola mata kuliah dan catatan belajarmu.</p>
        </div>
        <Button onClick={openCreateForm} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari subject..."
          className="pl-9 h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Belum ada subject. Klik "Add Subject" untuk membuat yang pertama.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((subject) => (
            <Card key={subject.id} className="p-5 hover-elevate transition-all relative group">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                >
                  <NotebookText className="w-5 h-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditForm(subject)} className="cursor-pointer">
                      <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                      Edit Subject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => { setDeletingId(subject.id); setIsDeleteOpen(true); }}
                      className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Subject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href={`/workspace/${subject.id}`}>
                <h3 className="font-semibold mb-1 hover:text-primary transition-colors cursor-pointer">
                  {subject.subject_name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-3">
                <Badge variant="secondary" className="font-mono text-xs font-normal">
                  {subject.notes_count} notes
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(subject.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Perbarui detail subject.' : 'Buat subject belajar baru.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Kalkulus 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => field.onChange(c)}
                            className="w-7 h-7 rounded-full border-2 transition-transform"
                            style={{
                              backgroundColor: c,
                              borderColor: field.value === c ? c : 'transparent',
                              transform: field.value === c ? 'scale(1.15)' : 'scale(1)',
                              boxShadow: field.value === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  Save
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
            <AlertDialogTitle>Hapus Subject?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua notes di dalam subject ini akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}