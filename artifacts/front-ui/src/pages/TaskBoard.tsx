import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import { useListTask, useAddTask, useUpdateTaskStatus, useUpdateTask, useDeleteTask } from '@/hooks/use-task';
import type { TaskStatus } from '@/types/task';
import type { Task } from '@/api/task';
import { AddTaskDialog } from '@/components/task-board/task-dialog';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useListSubjects } from '@/hooks/use-subject';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
];

const COLUMN_ACCENT: Record<TaskStatus, string> = {
    todo: 'bg-slate-400',
    in_progress: 'bg-amber-400',
    done: 'bg-emerald-400',
}

function TaskCard({ task, subjectName, overlay = false, onOpenDetail }: { task: Task; subjectName?: string; overlay?: boolean; onOpenDetail?: (task: Task) => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: task.id,
        data: { status: task.status, position: task.position },
    });
    const style = { 
        transform: CSS.Transform.toString(transform), 
        transition, 
        opacity: isDragging && !overlay ? 0.4 : 1, 
    };

    return (
        <div
            ref={overlay ? undefined : setNodeRef}
            style={overlay ? undefined : style}
            {...(overlay ? {} : attributes)}
            {...(overlay ? {} : listeners)}
            onClick={() => {
                if (!isDragging) onOpenDetail?.(task);
            }}
            className={`group rounded-lg border border-border/60 bg-card p-3 cursor-grab active:cursor-grabbing
                        shadow-sm transition-all duration-150
                        ${overlay ? 'shadow-xl ring-2 ring-primary/40 rotate-2 scale-105' : 'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5'}`}
        >
            {/* poin 1: badge status */}
            <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${COLUMN_ACCENT[task.status]}`} />
                {/* poin 3: badge mata kuliah */}
                {subjectName && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        {subjectName}
                    </span>
                )}
            </div>

            {/* poin 5: line-clamp judul */}
            <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                {task.title}
            </p>

            {task.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            )}

            {/* poin 2: timestamp relatif */}
            <p className="mt-2 text-[10px] text-muted-foreground/70">
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: localeId })}
            </p>
        </div>
    );
}

function Column({ col, items, subjectMap, onOpenDetail }: { col: (typeof COLUMNS)[number]; items: Task[]; subjectMap: Map<number, string>; onOpenDetail: (task: Task) => void; }) {
    const { setNodeRef, isOver } = useDroppable({
        id: col.id,
        data: { status: col.id, position: items.length },
    });

    return (
        <div className="rounded-xl bg-muted/30 border border-border/40 p-3">
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`h-2 w-2 rounded-full ${COLUMN_ACCENT[col.id]}`} />
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5 border border-border/50">
                    {items.length}
                </span>
            </div>
            <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`space-y-2 min-h-[120px] rounded-lg transition-colors duration-150
                                ${isOver ? 'bg-primary/5 ring-2 ring-primary/30 ring-inset' : ''}`}
                >
                    {items.map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            subjectName={subjectMap.get(task.subjectId)}
                            onOpenDetail={onOpenDetail}
                        />
                    ))}
                    {items.length === 0 && (
                        <div className="text-xs text-muted-foreground/60 text-center py-8 border border-dashed border-border/40 rounded-lg">
                            Belum ada task
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

function TaskDetailDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
    const deleteTask = useDeleteTask();

    const handleDelete = () => {
        if (!task) return;
        deleteTask.mutate(task.id, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{task?.title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task?.description || 'Tidak ada deskripsi.'}
                </p>
                <DialogFooter>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteTask.isPending}
                        className="gap-1.5"
                    >
                        <Trash2 className="h-4 w-4" />
                        {deleteTask.isPending ? 'Menghapus...' : 'Hapus Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function TaskBoard() {
    const { data, isLoading, isError } = useListTask();
    const { data: subjects } = useListSubjects();
    const updateStatus = useUpdateTaskStatus();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const subjectMap = useMemo(
        () => new Map((subjects ?? []).map((s) => [s.id, s.subject_name])),
        [subjects]
    );

    const sensors = useSensors(
        useSensor (PointerSensor, { activationConstraint: { distance: 4 } })
    );

    const taskByStatus = (status: TaskStatus) =>
    (data ?? []).filter((t) => t.status === status).sort((a, b) => a.position - b.position);

    const handleDragStart = (event: DragStartEvent) => {
        const task = (data ?? []).find((t) => t.id === event.active.id);
        setActiveTask(task ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as number;
        const targetStatus = over.data.current?.status as TaskStatus | undefined;

        const task = (data ?? []).find((t) => t.id === taskId);
        if (!task || !targetStatus) return;

        if (task.status === targetStatus) return;

        updateStatus.mutate({ id: taskId, newStatus: targetStatus, position: task.position });
    };

    if (isLoading) {
        return <div className="p-6 text-sm text-muted-foreground">Memuat task...</div>;
    }

    if (isError) {
        return <div className="p-6 text-sm text-destructive">Gagal memuat task. Coba muat ulang halaman.</div>;
    }

    return (
        <div className="p-6">
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold tracking-tight'>Task Board</h2>
                <AddTaskDialog />
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-3 gap-5">
                    {COLUMNS.map((col) => (
                        <Column key={col.id} col={col} items={taskByStatus(col.id)} subjectMap={subjectMap} onOpenDetail={setSelectedTask} />
                    ))}
                </div>
                <DragOverlay>
                    {activeTask ? (
                        <TaskCard task={activeTask} subjectName={subjectMap.get(activeTask.subjectId)} overlay />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <TaskDetailDialog task={selectedTask} onClose={() => setSelectedTask(null)} />
        </div>
    );
}