import React, { createContext, useContext, useReducer, useCallback } from 'react';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    subjectId?: string;
    status: TaskStatus;
    position: number;
}

export function useListTask() {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: () => api.get<{ data: Task[]}>('/tasks'),
    });
}

export function useUpdateTaskPosition() {
    const qc = useQuertClient();
    return useMutation({
        mutationFn: ({ id, status, position }: { id: string; status: TaskStatus; position: number }) =>
            api.patch(`/tasks/${id}/position`, { status, position }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}