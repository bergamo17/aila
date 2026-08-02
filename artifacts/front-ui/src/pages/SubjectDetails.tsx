import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSubject, useListNotes, useCreateNote, useDeleteNote } from '@/lib/workspace-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, MoreHorizontal, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const noteSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  content: z.string().optional().default(''),
});
type NoteFormValues = z.infer<typeof noteSchema>;

export default function SubjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: subject } = useSubject(id);
  const { data: notesData } = useListNotes(id);
  const createMutation = useCreateNote();
  const deleteMutation = useDeleteNote();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', content: '' },
  });

  if (!subject) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Subject tidak ditemukan.
        <div className="mt-4">
          <Link href="/workspace"><Button variant="outline" size="sm">Kembali</Button></Link>
        </div>
      </div>
    );
  }

  const onSubmit = (values: NoteFormValues) => {
    createMutation.mutate(
      { data: { subjectId: subject.id, title: values.title, content: values.content ?? '' } },
      {
        onSuccess: () => {
          toast({ title: 'Note berhasil dibuat' });
          form.reset();
          setIsFormOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <Link href="/workspace">
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workspace
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-8 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {notesData.data.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Belum ada catatan di subject ini.
        </Card>
      ) : (
        <div className="space-y-3">
          {notesData.data.map((note) => (
            <Card key={note.id} className="p-4 hover-elevate transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{note.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {note.content || 'Tidak ada isi'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        deleteMutation.mutate(
                          { id: note.id },
                          { onSuccess: () => toast({ title: 'Note dihapus' }) },
                        )
                      }
                      className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Note</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl><Input placeholder="e.g. Integral Parsial" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Isi Catatan</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Tulis catatanmu..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>Save Note</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}