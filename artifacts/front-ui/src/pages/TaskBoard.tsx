import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useListTask, useUpdateTaskPosition, type TaskStatus, type Task } from '@/lib/task-board-store';

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

function TaskCard({ task, overlay = false }: { task: Task; overlay?: boolean }) {
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
            className={`rounded-lg border border-border/60 bg-card p-3 cursor-grab active:cursor-grabbing
                        shadow-sm transition-shadow duration-150
                        ${overlay ? 'shadow-xl ring-2 ring-primary/40 rotate-2 scale-105' : 'hover:shadow-md hover:border-border'}`}
        >
            <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
            {task.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            )}
        </div>
    );
}

function Column({ col, items }: { col: (typeof COLUMNS)[number]; items: Task[] }) {
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
                    {items.map((task) => <TaskCard key={task.id} task={task} />)}
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

export default function TaskBoard() {
    const { data } = useListTask();
    const updatePosition = useUpdateTaskPosition();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor (PointerSensor, { activationConstraint: { distance: 4 } })
    );

    const taskByStatus = (status: TaskStatus) =>
        (data?.data ?? []).filter((t) => t.status === status).sort((a, b) => a.position - b.position);

    const handleDragStart = (event: DragStartEvent) => {
        const task = (data?.data ?? []).find((t) => t.id === event.active.id);
        setActiveTask(task ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as string;
        const targetStatus = over.data.current?.status as TaskStatus | undefined;
        const targetPosition = over.data.current?.position as number | undefined;

        if (targetStatus) {
            updatePosition.mutate({ id: taskId, status: targetStatus, position: targetPosition ?? 0 });
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold tracking-tight mb-6">Task Board</h2>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-3 gap-5">
                    {COLUMNS.map((col) => (
                        <Column key={col.id} col={col} items={taskByStatus(col.id)} />
                    ))}
                </div>
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} overlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}