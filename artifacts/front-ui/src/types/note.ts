import { number, string } from "zod";

export interface Note {
    id: number;
    subject_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    title: string;
}

export interface CreateNoteRequest {
    subject_id: number;
    title: string;
    content: string;
}

export interface NewNote {
    id: number;
    subject_id: number;
    title: string;
    content: string;
    created_at: string;
}

