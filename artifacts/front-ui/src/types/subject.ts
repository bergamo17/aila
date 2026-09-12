import { number, string } from "zod";

export interface CreateSubjectRequest {
    subject_name: string;
}

export interface SubjectResponse {
    subject_name: string;
    created_at: string;
}
