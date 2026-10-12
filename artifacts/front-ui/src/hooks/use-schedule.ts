import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "@/api/schedule";
import type {
    ScheduleRequest,
    ScheduleResponse,
    ScheduleStatus,
} from "@/types/schedule";
import { useAuthStore } from "@/lib/auth-store";
import { TASK_KEY } from "./use-task";

export const SCHEDULE_KEY = ["schedules"] as const;


// ------Queries---------

export function useScheduleByDate(date: string) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: [...SCHEDULE_KEY, "date", date],
        queryFn: () => scheduleApi.listByDate({ date }),
        enabled: isAuthenticated && !!date,
    });
}

export function useScheduleByRange(from: string, to: string) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: [...SCHEDULE_KEY, "range", from, to],
        queryFn: () => scheduleApi.listByDateRange({ from, to }),
        enabled: isAuthenticated && !!from && !!to,
    });
}

export function useUpcomingSchedule(date: string) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: [...SCHEDULE_KEY, "upcoming", date],
        queryFn: () => scheduleApi.listUpcoming({ date }),
        enabled: isAuthenticated && !!date,
    });
}

export function useScheduleById(id: number | undefined) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: [...SCHEDULE_KEY, "detail", id],
        queryFn: () => scheduleApi.getById(id as number),
        enabled: isAuthenticated && id != undefined,
    });
}

// ------Mutations---------

export function useAddSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ScheduleRequest) => scheduleApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY });
            queryClient.invalidateQueries({ queryKey: TASK_KEY });
        },
    });
}

export function useUpdateSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: ScheduleRequest }) => scheduleApi.update(payload, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
    });
}

type StatusContext = { snapshots: [readonly unknown[], unknown][] };

export function useUpdateScheduleStatus() {
    const queryClient = useQueryClient();
    return useMutation<
        ScheduleResponse,
        Error,
        { id: number, payload: ScheduleStatus },
        StatusContext
    >({
        mutationFn: ({ id, payload }) => scheduleApi.updateStatus(payload, id),
        onMutate: async ({ id, payload }) => {
            await queryClient.cancelQueries({ queryKey: SCHEDULE_KEY });
            const snapshots = queryClient.getQueriesData({ queryKey: SCHEDULE_KEY }) as StatusContext["snapshots"];
            queryClient.setQueriesData<ScheduleResponse[] | ScheduleResponse>(
                {queryKey: SCHEDULE_KEY},
                (old) => {
                    if (Array.isArray(old)) {
                        return old.map((s) => 
                            s.id === id ? {...s, is_completed: payload.is_completed }: s,
                        );
                    }
                    if (old && old.id === id){
                        return {...old, is_completed: payload.is_completed};
                    }
                    return old;
                },
            );
            return { snapshots };
        },
        onError: (_err, _vars, context) => {
            context?.snapshots.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY });
        },
    });
}

export function useDeleteSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => scheduleApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY });
            queryClient.invalidateQueries({ queryKey: TASK_KEY });
        },
    });
}