export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface CreateTaskRequest {
    subject_id: number;
    title: string;
    description: string;
}

export interface UpdateTaskRequest {
    title: string;
    description: string;
}

export interface UpdateTaskStatusRequest {
    task_status: string;
}

export interface TaskResponse {
    id: number;
    subject_id: number;
	title: string;
	task_status: string;
    position: number;
    description: string;
	created_at: string;
	updated_at: string;
}