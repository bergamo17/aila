import apiFetch from "@/lib/api";
import type { SubjectRequest, SubjectResponse, SubjectWithNotesCountResponse } from "@/types/subject";

export const subjectApi = {
    create: async (payload: SubjectRequest): Promise<SubjectResponse> => {
        return await apiFetch("/subject/create", {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    getById: async (id: number): Promise<SubjectResponse> => {
        return await apiFetch(`/subject/${id}`, {
            method: "GET",
            requireAuth: true,
        });
    },
    listByUser: async(): Promise<SubjectWithNotesCountResponse[]> => {
        return await apiFetch("/subject", {
            method: "GET",
            requireAuth: true,
        });
    },
    update: async (id: number, payload: SubjectRequest): Promise<SubjectResponse> => {
        return await apiFetch(`/subject/${id}`, {
            method: "PUT",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    delete: async (id: number): Promise<void> => {
        return await apiFetch(`/subject/${id}`, {
            method: "DELETE",
            requireAuth: true,
        });
    },
};