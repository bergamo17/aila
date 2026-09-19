import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { useAddTask } from '@/hooks/use-task';
import { useListSubjects } from '@/hooks/use-subject';

export function AddTaskDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState<string>('');

    const addTask = useAddTask();
    const { data: subjects, isLoading: subjectsLoading } = useListSubjects();

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSubjectId('');
    };

    const handleSubmit = () => {
        if (!title.trim() || !subjectId) return;

        addTask.mutate(
            {
                subject_id: Number(subjectId),
                title: title.trim(),
                description: description.trim(),
            },
            {
                onSuccess: () => {
                    resetForm();
                    setOpen(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Tambah Task
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Task Baru</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Mata Kuliah</label>
                        <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder={subjectsLoading ? "Memuat..." : "Pilih mata kuliah"} />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects?.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.subject_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Judul</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Judul task"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Deskripsi</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Opsional"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !subjectId || addTask.isPending}
                    >
                        {addTask.isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}