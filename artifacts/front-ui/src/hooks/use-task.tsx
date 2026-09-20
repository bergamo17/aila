import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTask,
         createTask,
         updateTask,
         updateTaskStatus,
         deleteTask,
         Task,
         STATUS_TO_BACKEND,
         STATUS_FROM_BACKEND } from "@/api/task";
import type { CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest, TaskStatus } from "@/types/task";
import { useAuthStore } from "@/lib/auth-store";

export const TASK_KEY =["tasks"];

export function useListTask() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: TASK_KEY,
        queryFn: fetchTask,
        enabled: isAuthenticated,
    });
}

export function useAddTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTaskRequest) => createTask(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASK_KEY }),
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskRequest }) =>
            updateTask(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TASK_KEY }),
    });
}

export function useUpdateTaskStatus() {
    const queryClient = useQueryClient();
    return useMutation<Task, Error, {id: number; newStatus: TaskStatus; position: number}, { previousTask?: Task[] }>({
        mutationFn: ({ id, newStatus, position }) =>
            updateTaskStatus(id, { task_status: STATUS_TO_BACKEND[newStatus], position }),

        onMutate: () => ({
            previousTask: queryClient.getQueryData<Task[]>(TASK_KEY),
        }),

        onError: (_err, _vars, context) => {
            if (context?.previousTask) {
                queryClient.setQueryData(TASK_KEY, context.previousTask);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASK_KEY });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteTask(id),
        onSuccess: (_data) => queryClient.invalidateQueries({ queryKey: TASK_KEY }),
    });
}