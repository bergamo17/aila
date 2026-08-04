import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useListTasks, useUpdateTaskPosition, type TaskStatus, type Task } from '@/lib/task-board-store';

const COLUMNS = { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'inprogress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
];

function TaskCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className="rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
            <p className="font-medium text-sm">{task.title}</p>
        </div>
    );
}

export default function TaskBoard() {
    const { data } = useListTask();
    const updatePosition = useUpdateTaskPosition();

    const taskByStatus = (status: TaskStatus) =>
        (data?.data ?? []).filter((t) => t.status === status).sort((a, b) => a.position - b.position);

    const handleDragEnd = (event: DragEndEvent) => {
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
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-4">
                {COLUMNS.map((col) => (
                <div key={col.id} className="rounded-lg bg-muted/40 p-3">
                    <h3 className="font-semibold text-sm mb-3">{col.label}</h3>
                    <SortableContext items={tasksByStatus(col.id).map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 min-h-[200px]">
                        {tasksByStatus(col.id).map((task) => (
                        <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                    </SortableContext>
                </div>
                ))}
            </div>
        </DndContext>
    );
}