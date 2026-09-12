import apiFetch from "@/lib/api";
import type { CreateSubjectRequest, SubjectResponse } from "@/types/subject";
import { X } from "lucide-react";

export const subjectApi = {
    create: async (payload: CreateSubjectRequest): Promise<SubjectResponse> => {
        return await apiFetch("/subject/create", {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        })
    },
    getById: async (id: number): Promise<SubjectResponse> => {
        return await apiFetch(`/subject/${id}`, {
            method: "GET",
            requireAuth: true,
        });
    },
    listByUser: async(): Promise<SubjectResponse[]> => {
        return await apiFetch("/subject", {
            method: "GET",
            requireAuth: true,
        });
    },    
};