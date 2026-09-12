import { noteApi } from "@/api/note";
import React, { createContext, useContext, useReducer, useCallback } from "react";

export interface Subject {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface Note {
    id: string;
    subjectId: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceState {
    subjects: Subject[];
    notes: Note[];
}

type Action = 
    | {type: "ADD_SUBJECT"; payload: Subject}
    | {type: "UPDATE_SUBJECT"; payload: {id: string; data: Partial<Subject>}}
    | {type: "DELETE_SUBJECT"; payload: {id: string}}
    | {type: "ADD_NOTE"; payload: Note}
    | {type: "UPDATE_NOTE"; payload: {id: string; data: Partial<Note>}}
    | {type: "DELETE_NOTE"; payload: {id: string}};

const now = () => new Date().toISOString();
const genId = () => Math.random().toString(36).slice(2, 10);

const initialState: WorkspaceState = {
    subjects: [
        {id: 's1', name: 'Kalkulus 1', color: '#3b82f6', createdAt: now(), updatedAt: now()},
        {id: 's2', name: 'Logika Matematika', color: '#10b981', createdAt: now(), updatedAt: now()},
        {id: 's3', name: 'Aljabar 1', color: '#f59e0b', createdAt: now(), updatedAt: now()},
        {id: 's4', name: 'Dasar Pemrograman', color: '#DC143C', createdAt: now(), updatedAt: now()},
    ],
    notes: [
        {id: 'n1', subjectId: 's1', title: 'Kekontinuan', content: 'Teorema 1.1...', createdAt: now(), updatedAt: now()},
        {id: 'n2', subjectId: 's2', title: 'Modus Tolen', content: 'Modus Tolen adalah...', createdAt: now(), updatedAt: now()},
        {id: 'n1', subjectId: 's3', title: 'Grup', content: 'Sifat-sifat Grup...', createdAt: now(), updatedAt: now()},
        {id: 'n1', subjectId: 's4', title: 'Algoritma', content: 'Algoritma...', createdAt: now(), updatedAt: now()},
    ],
};

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
    switch (action.type) {
        case 'ADD_SUBJECT':
            return {...state, subjects: [action.payload, ...state.subjects]};
        case 'DELETE_SUBJECT':
            return {
                ...state,
                subjects: state.subjects.filter((s)=>s.id !== action.payload.id),
                notes: state.notes.filter((n)=>n.subjectId !== action.payload.id),
            };
        case 'UPDATE_SUBJECT':
            return {
                ...state,
                subjects: state.subjects.map((s) =>
                    s.id === action.payload.id ? {...s, ...action.payload.data, updatedAt:now()} : s,
                ),
            };
        case 'ADD_NOTE':
            return {...state, notes: [action.payload, ...state.notes]};
        case 'UPDATE_NOTE':
            return {
                ...state,
                notes: state.notes.map((n) =>
                    n.id === action.payload.id ? {...n, ...action.payload.data, updatedAt: now()} : n,
                ),
            };
        case 'DELETE_NOTE':
            return {...state, notes: state.notes.filter((n) => n.id !== action.payload.id)};
        default:
            return state;
    }
}

const WorkspaceContext = createContext<{
    state: WorkspaceState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function WorkspaceProvider({children}: {children: React.ReactNode}) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <WorkspaceContext.Provider value={{state, dispatch}}>
            {children}
        </WorkspaceContext.Provider>
    );
}

function useWorkspaceStore() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) throw new Error('useWorkspaceStore must be used within WorkspaceProvider');
    return ctx;
}

export function useListSubjects() {
    const {state} = useWorkspaceStore();
    const data = state.subjects.map((s) => ({
        ...s,
        notesCount: state.notes.filter((n) => n.subjectId === s.id).length,
    }));
    return {data: {data, total: data.length}, isLoading: false};
}

export function useSubject(id: string | undefined) {
    const {state} = useWorkspaceStore();
    const subject = state.subjects.find((s) => s.id === id);
    return {data: subject, isLoading: false};
}

export function useListNotes(subjectId: string | undefined) {
    const {state} = useWorkspaceStore();
    const data = subjectId ? state.notes.filter((n) => n.subjectId === subjectId) : [];
    return {data: {data, total: data.length}, isLoading: false};
}

export function useCreateSubject() {
    const {dispatch} = useWorkspaceStore();
    const mutate = useCallback(
        (input: {data: {name: string; color: string}}, opts?: {onSuccess?: () => void}) => {
            dispatch({
                type: 'ADD_SUBJECT',
                payload: {id: genId(), ...input.data, createdAt: now(), updatedAt: now()},
            });
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return {mutate, isPending: false};
}

export function useUpdateSubject() {
    const {dispatch} = useWorkspaceStore();
    const mutate = useCallback(
        (input: {id: string; data: Partial<Subject>}, opts?: {onSuccess?: () => void}) => {
            dispatch({type: 'UPDATE_SUBJECT', payload: input});
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return {mutate, isPending: false};
}

export function useDeleteSubject() {
    const {dispatch} = useWorkspaceStore();
    const mutate = useCallback(
        (input: {id: string}, opts?: {onSuccess?: () => void}) => {
            dispatch({type: 'DELETE_SUBJECT', payload: input});
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return {mutate, isPending: false};
}

export function useCreateNote() {
    const {dispatch} = useWorkspaceStore();
    const mutate = useCallback(
        async (
            input: {data: {subjectId: string; title: string; content: string}},
            opts?: {onSuccess?: () => void; onError?: (e: Error) => void},
        ) => {
            try {
                const note = await noteApi.create({
                    subject_id: Number(input.data.subjectId),
                    title: input.data.title,
                    content: input.data.content,
                });
                dispatch({
                    type: 'ADD_NOTE',
                    payload: {
                        id: String(note.id),
                        subjectId: input.data.subjectId,
                        title: note.title,
                        content: note.content,
                        createdAt: note.created_at,
                        updatedAt: note.created_at,
                    },
                });
                opts?.onSuccess?.();
            } catch (e) {
                opts?.onError?.(e as Error);
            }
        },
        [dispatch],
    );
    return {mutate, isPending: false};
}

export function useUpdateNote() {
    const {dispatch} = useWorkspaceStore();
    const mutate = useCallback(
        (input: {id: string; data: Partial<Note>}, opts?: {onSuccess?: () => void}) => {
            dispatch({type: 'UPDATE_NOTE', payload: input});
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return {mutate, isPending: false};
}

export function useDeleteNote() {
    const {dispatch} = useWorkspaceStore();
    const mutate = useCallback(
        (input: {id: string}, opts?: {onSuccess?: () => void}) => {
            dispatch({type: 'DELETE_NOTE', payload: input});
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return {mutate, isPending: false};
}