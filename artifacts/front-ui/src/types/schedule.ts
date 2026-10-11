export type EventType = 'task' | 'exam' | 'study_session' | 'reminder'

export interface ScheduleRequest {
    subject_id: number;
    task_id?: number | null;
    title: string;
    event_date: string;
    reminder: boolean;
    type: string;
    start_time?: string | null;
    end_time?: string | null;
}

export interface ScheduleResponse {
    id: number;
    subject_id: number;
    task_id?: number | null;
    title: string;
    event_date: string;
    reminder: boolean;
    type: string;
    is_completed: boolean;
    start_time?: string | null;
    end_time?: string | null;
}

export interface ScheduleDateQuery {
    date: string;
}

export interface ScheduleDateRange {
    from: string;
    to: string;
}

export interface ScheduleStatus {
    is_completed: boolean;
}