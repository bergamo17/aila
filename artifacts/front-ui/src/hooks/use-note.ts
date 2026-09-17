import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { noteApi } from "@/api/note";
import type { CreateNoteRequest } from "@/types/note";

const noteKeys = {
    all: ["notes"] as const,
    byUser: ["notes", "user"] as const,
    bySubject: (subjectId: number) => ["notes", "subject", subjectId] as const,
    detail: (id: number) => ["notes", "detail", id] as const,
};

export function useListNoteBySubject(subjectId: number) {
    return useQuery({
        queryKey: noteKeys.bySubject(subjectId),
        queryFn: () => noteApi.listBySubject(subjectId),
        enabled: !!subjectId,
    });
}

export function useListNoteByUser() {
    return useQuery({
        queryKey: noteKeys.byUser,
        queryFn: () => noteApi.listByUser(),
    });
}

export function useGetNote(id: number) {
    return useQuery({
        queryKey: noteKeys.detail(id),
        queryFn: () => noteApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateNoteRequest) => noteApi.create(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: noteKeys.bySubject(data.subject_id) });
            queryClient.invalidateQueries({ queryKey: noteKeys.byUser });
        },
    });
}

export function useDeleteNote(subjectId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => noteApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: noteKeys.bySubject(subjectId) });
            queryClient.invalidateQueries({ queryKey: noteKeys.byUser });
        },
    });
}