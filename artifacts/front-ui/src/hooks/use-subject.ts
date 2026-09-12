import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import { subjectApi } from "@/api/subject";
import type { CreateSubjectRequest } from "@/types/subject";

const SUBJECT_KEY = ["subjects"];

export function useListSubjects() {
    return useQuery({
        queryKey: SUBJECT_KEY,
        queryFn: subjectApi.listByUser,
    });
}

export function useSubject(id: number | undefined) {
    return useQuery({
        queryKey: [...SUBJECT_KEY, id],
        queryFn: () => subjectApi.getById(id!),
        enabled: !!id,
    });
}

export function useCreateSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSubjectRequest) => subjectApi.create(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: SUBJECT_KEY }),
    });
}