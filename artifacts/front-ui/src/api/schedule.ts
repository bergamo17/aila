import apiFetch from "@/lib/api";
import type{
    ScheduleRequest,
    ScheduleResponse,
    ScheduleDateQuery,
    ScheduleDateRange,
    ScheduleStatus,
} from "@/types/schedule";

const toQuery = (params: Record<string, string>) =>
    new URLSearchParams(params).toString();

export const scheduleApi = {
    create: async (payload: ScheduleRequest): Promise<ScheduleResponse> => {
        return await apiFetch("/schedule", {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    update: async (payload: ScheduleRequest, id: number): Promise<ScheduleResponse> => {
        return await apiFetch(`/schedule/${id}`, {
            method: "PUT",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    updateStatus: async (payload: ScheduleStatus, id: number): Promise<ScheduleResponse> => {
        return await apiFetch(`/schedule/${id}/status`, {
            method: "PUT",
            requireAuth: true,
            body: JSON.stringify(payload),
        });
    },
    getById: async (id: number): Promise<ScheduleResponse> => {
        return await apiFetch(`/schedule/${id}`, {
            method: "GET",
            requireAuth: true,
        });
    },
    listByDate: async (q: ScheduleDateQuery): Promise<ScheduleResponse[]> => {
        return await apiFetch(`/schedule?${toQuery({...q})}`, {
            method: "GET",
            requireAuth: true,
        });
    },
    listByDateRange: async (q: ScheduleDateRange): Promise<ScheduleResponse[]> => {
        return await apiFetch(`/schedule/range?${toQuery({...q})}`, {
            method: "GET",
            requireAuth: true,
        });
    },
    listUpcoming: async (q: ScheduleDateQuery): Promise<ScheduleResponse[]> => {
        return await apiFetch(`/schedule/upcoming?${toQuery({...q})}`, {
            method: "GET",
            requireAuth: true,
        });
    },
    delete: async (id: number): Promise<void> => {
        return await apiFetch(`/schedule/${id}`, {
            method: "DELETE",
            requireAuth: true,
        });
    },
};