import apiFetch from "@/lib/api";
import type { 
    CreateTaskRequest, 
    CreateTaskResponse, 
    UpdateTaskRequest, 
    UpdateTaskResponse, 
    UpdateTaskStatusRequest } from "@/types/task";

export const taskApi = {
    create: async (payload: CreateTaskRequest): Promise<CreateTaskResponse> => {
        return await apiFetch("/task/create", {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    update: async (id: number, payload: UpdateTaskRequest): Promise<UpdateTaskResponse> => {
        return await apiFetch(`/task/${id}`, {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    updateStatus: async (id: number, payload: UpdateTaskStatusRequest): Promise<UpdateTaskResponse> => {
        return await apiFetch(`/task/status/${id}`, {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    delete: async(id: number): Promise<void> => {
        return await apiFetch(`/task/delete/${id}`, {
            method: "POST",
            requireAuth: true,
        });
    },
};