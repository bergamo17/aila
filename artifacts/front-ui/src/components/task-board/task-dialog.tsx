import { useState } from 'react';
import { Plus, CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAddTask } from '@/hooks/use-task';
import { useListSubjects } from '@/hooks/use-subject';

export function AddTaskDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const addTask = useAddTask();
    const { data: subjects, isLoading: subjectsLoading } = useListSubjects();

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSubjectId('');
        setDeadline(undefined);
    };

    const handleSubmit = () => {
        if (!title.trim() || !subjectId) return;

        addTask.mutate(
            {
                subject_id: Number(subjectId),
                title: title.trim(),
                description: description.trim(),
                deadline: deadline ? deadline.toISOString() : null,
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

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Deadline (Opsional)</label>
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !deadline && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {deadline ? format(deadline, "d MMMM yyyy", { locale: localeId }) : "Pilih tanggal"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                <Calendar
                                    mode="single"
                                    selected={deadline}
                                    onSelect={(date) => {
                                        setDeadline(date);
                                        setDatePickerOpen(false); // auto-close setelah pilih tanggal
                                    }}
                                    initialFocus
                                />
                                {deadline && (
                                    <div className="p-2 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-muted-foreground gap-1.5"
                                            onClick={() => {
                                                setDeadline(undefined);
                                                setDatePickerOpen(false);
                                            }}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Hapus deadline
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
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