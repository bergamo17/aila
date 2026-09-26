export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface CreateTaskRequest {
    subject_id: number;
    title: string;
    description?: string;
    deadline?: string | null;
}

export interface UpdateTaskRequest {
    title: string;
    description?: string | null;
    deadline?: string | null;
}

export interface UpdateTaskStatusRequest {
    task_status: string;
    position: number;
}

export interface TaskResponse {
    id: number;
    subject_id: number;
	title: string;
	task_status: string;
    position: number;
    description: string | null;
    deadline: string | null;
	created_at: string;
	updated_at: string;
}