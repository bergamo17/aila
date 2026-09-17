import apiFetch from "@/lib/api";
import type { Note, CreateNoteRequest, NoteResponse } from "@/types/note";

export const noteApi = {
    create: async (payload: CreateNoteRequest): Promise<NoteResponse> => {
        return await apiFetch("/note/create", {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    getById: async (id: number): Promise<NoteResponse> => {
        return await apiFetch(`/note/${id}`, {
            method: "GET",
            requireAuth: true,
        });
    },
    delete: async (id: number): Promise<void> => {
        return await apiFetch(`/note/${id}`, {
            method: "DELETE",
            requireAuth: true,
        });
    },
    listBySubject: async(subject_id: number): Promise<NoteResponse[]> => {
        return await apiFetch(`/subject/${subject_id}/notes`, {
            method: "GET",
            requireAuth: true,
        });
    },
    listByUser: async(): Promise<NoteResponse[]> => {
        return await apiFetch("/user/notes", {
            method: "GET",
            requireAuth: true,
        });
    },
};