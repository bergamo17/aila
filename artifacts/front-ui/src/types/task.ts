export type TaskStatus = 'to do' | 'in progress' | 'done';

export interface CreateTaskRequest {
    subject_id: number;
    title: string;
}

export interface CreateTaskResponse {
    id: number;
    subject_id: number;
    task_status: string;
    title: string;
}

export interface UpdateTaskRequest {
    title: string;
}

export interface UpdateTaskResponse {
    title: string;
    task_status: string;
    updated_at: string;
}

export interface UpdateTaskStatusRequest {
    task_status: string;
}

export interface TaskResponse {
    id: number;
    user_id: number;
    subject_id: number;
	title: string;
	task_status: string;
	created_at: string;
	updated_at: string;
}