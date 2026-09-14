import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import { subjectApi } from "@/api/subject";
import type { SubjectRequest } from "@/types/subject";

const SUBJECT_KEY = ["subjects"];

export function useListSubjects() {
    return useQuery({
        queryKey: SUBJECT_KEY,
        queryFn: subjectApi.listByUser,
    });
}

export function useGetSubject(id: number | undefined) {
    return useQuery({
        queryKey: [...SUBJECT_KEY, id],
        queryFn: () => subjectApi.getById(id!),
        enabled: !!id,
    });
}

export function useCreateSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: SubjectRequest) => subjectApi.create(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: SUBJECT_KEY }),
    });
}

export function useUpdateSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, payload}: {id: number, payload: SubjectRequest}) => subjectApi.update(id, payload),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({queryKey: SUBJECT_KEY});
            qc.invalidateQueries({queryKey: [...SUBJECT_KEY, id]});
        }
    });
}

export function useDeleteSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => subjectApi.delete(id),
        onSuccess: (_data, id) => {
            qc.invalidateQueries({ queryKey: SUBJECT_KEY });
            qc.removeQueries({ queryKey: [...SUBJECT_KEY, id] });
        },
    });
}