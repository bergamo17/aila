export interface CreateSubjectRequest {
    subject_name: string;
    color: string;
}

export interface SubjectResponse {
    id: number;
    subject_name: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface SubjectWithNotesCountResponse extends SubjectResponse {
    notes_count: number;
}
