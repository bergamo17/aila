import apiFetch from "@/lib/api";
import type { 
    CreateTaskRequest, 
    UpdateTaskRequest, 
    UpdateTaskStatusRequest,
    TaskStatus,
    TaskResponse } from "@/types/task";

export interface Task {
    id: number;
    subjectId: number;
    title: string;
    status: TaskStatus;
    position: number;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export const STATUS_TO_BACKEND: Record<TaskStatus, string> = {
    todo: 'to do',
    in_progress: 'in progress',
    done: 'done',
}

export const STATUS_FROM_BACKEND: Record<string, TaskStatus> = {
    'to do': 'todo',
    'in progress': 'in_progress',
    'done': 'done',
}

function mapTaskFromApi(raw: any): Task {
    return{
        id: raw.id,
        subjectId: raw.subject_id,
        title: raw.title,
        status: STATUS_FROM_BACKEND[raw.task_status] ?? 'todo',
        position: raw.position,
        description: raw.description ?? '',
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
    };
}

export async function fetchTask(): Promise<Task[]> {
    const res: TaskResponse[] = await apiFetch("/task");
    return res.map(mapTaskFromApi);
}

export async function createTask(payload: CreateTaskRequest): Promise<Task> {
    const res: TaskResponse = await apiFetch("/task/create", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify(payload),
    });
    return mapTaskFromApi(res);
}

export async function updateTask(id: number, payload: UpdateTaskRequest): Promise<Task> {
    const res: TaskResponse = await apiFetch(`/task/${id}`, {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify(payload),
    });
    return mapTaskFromApi(res);
}

export async function updateTaskStatus(id: number, payload: UpdateTaskStatusRequest): Promise<Task> {
    const res: TaskResponse = await apiFetch(`/task/status/${id}`, {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify(payload),
    });
    return mapTaskFromApi(res);
}

export async function deleteTask(id: number): Promise<void> {
    await apiFetch(`/task/${id}`, {
        method: "DELETE",
        requireAuth: true,
    });
}