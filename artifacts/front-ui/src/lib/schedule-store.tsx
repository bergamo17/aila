import React, { createContext, useContext, useReducer, useCallback } from 'react';

export type EventType = 'task' | 'exam' | 'study_session' | 'reminder';
export type EventStatus = 'pending' | 'completed';

export interface ScheduleEvent {
    id: string;
    title: string;
    subjectId?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    type: EvenType;
    status: EventStatus;
}

interface ScheduleState {
    events: ScheduleEvent[];
}

type Action = 
    | { type: 'ADD_EVENT'; payload: ScheduleEvent }
    | { type: 'UPDATE_EVENT'; payload: { id: string; data: Partial<ScheduleEvent> } }
    | { type: 'DELETE_EVENT'; payload: { id: string } };

const genId = () => Math.random().toString(36).slice(2, 10);

function todayPlus(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

const initialState: ScheduleState = {
    events: [
        {
            id: 'e1', title: 'Kerjakan tugas Aljabar 1', subjectId: 's3',
            date: todayPlus(2), type: 'task', status: 'pending',
        },
        {
            id: 'e2', title: 'Ujian Kalkulus 1', subjectId: 's1',
            date: todayPlus(3), startTime: '09:00', endTime: '11:00',
            type: 'exam', status: 'pending',
        },
        {
            id: 'e3', title: 'Review catatan Dasar Pemrograman', subjectId: 's4',
            date: todayPlus(0), type: 'reminder', status: 'pending',
        },
    ],
};

function reducer(state: ScheduleState, action: Action): ScheduleState {
    switch (action.type) {
        case 'ADD_EVENT':
            return { ...state, events: [action.payload, ...state.events] };
        case 'UPDATE_EVENT':
            return {
                ...state, 
                events: state.events.map((e) => 
                    e.id === action.payload.id ? { ...e, ...action.payload.data } : e,
                ),
            };
        case 'DELETE_EVENT':
            return { ...state, events: state.events.filter((e) => e.id !== action.payload.id) };
        default:
            return state;
    }
}

const ScheduleContext = createContext<{
    state: ScheduleContext;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <ScheduleContext.Provider value={{ state, dispatch }}>
            {children}
        </ScheduleContext.Provider>
    );
}

function useScheduleStore() {
    const ctx = useContext(ScheduleContext);
    if (!ctx) throw new Error('useScheduleStore must be used within ScheduleProvider');
    return ctx;
}

export function useListEvents() {
    const { state } = useScheduleStore();
    const data = [...state.events].sort((a, b) => a.date.localeCompare(b.date));
    return { data: { data, total: data.length }, isLoading: false };
}

export function useCreateEvent() {
    const { dispatch } = useScheduleStore();
    const mutate = useCallback(
        (input: { data: Omit<ScheduleEvent, 'id' | 'status'> }, opts?: { onSuccess?: () => void}) => {
            dispatch({
                type: 'ADD_EVENT',
                payload: { id: genId(), status: 'pending', ...input.data },
            });
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return { mutate, isPending: false }; 
}

export function useUpdateEvent() {
    const { dispatch } = useScheduleStore();
    const mutate = useCallback(
        (input: { id: string; data: Parsial<ScheduleEvent> }, opts?: { onSuccess?: () => void}) => {
            dispatch({ type: 'UPDATE_EVENT', payload: input });
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return { mutate, isPending: false };
}

export function useDeleteEvent() {
    const { dispatch } = useScheduleStore();
    const mutate = useCallback(
        (input: { id: string }, opts?: { onSuccess?: () => void }) => {
            dispatch({ type: 'DELETE_EVENT', payload: input });
            opts?.onSuccess?.();
        },
        [dispatch],
    );
    return { mutate, isPending: false };
}