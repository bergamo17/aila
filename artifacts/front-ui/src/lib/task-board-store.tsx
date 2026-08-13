import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    subjectId?: string;
    status: TaskStatus;
    position: number;
    createdAt: string;
    updatedAt: string;
}

let idCounter = 1;
function nextId() {
    return `task-${idCounter++}`;
}

function seedTasks(): Task[] {
    const now = new Date().toISOString();
    return [
        { id: nextId(), title: 'Review Catatan Dasar Pemrograman', status: 'done', position: 0, createdAt: now, updatedAt: now },
        { id: nextId(), title: 'Kerjakan Tugas Aljabar 1', status: 'in_progress', position: 0, createdAt: now, updatedAt: now },
        { id: nextId(), title: 'Belajar untuk Ujian Kalkulus 1', status: 'todo', position: 0, createdAt: now, updatedAt: now },
        { id: nextId(), title: 'Kerjakan Tugas Logika Matematika', status: 'todo', position: 1, createdAt: now, updatedAt: now },
    ];
}

type Action = 
    | { type: 'UPDATE_POSITION'; id: string; status: TaskStatus; position: number }
    | { type: 'ADD_TASK'; task: Task }
    | { type: 'REMOVE_TASK'; id: string };

function reorder(tasks: Task[], id: string, status: TaskStatus, position: number): Task[] {
    const moving = tasks.find((t) => t.id === id);
    if (!moving) return tasks;

    const withoutMoving = tasks.filter((t) => t.id !== id);

    const destColumnTasks = withoutMoving.filter((t) => t.status === status).sort((a,b) => a.position - b.position);

    const clampedPosition = Math.max(0, Math.min(position, destColumnTasks.length));

    destColumnTasks.splice(clampedPosition, 0, { ...moving, status, updatedAt: new Date().toISOString() });

    const renumberedDest = destColumnTasks.map((t, i) => ({ ...t, position: i }));

    const others = withoutMoving.filter((t) => t.status !== status);

    return [...others, ...renumberedDest];
}

function reducer(state: Task[], action: Action): Task[] {
    switch (action.type) {
        case 'UPDATE_POSITION':
            return reorder(state, action.id, action.status, action.position);
        case 'ADD_TASK':
            return [...state, action.task];
        case 'REMOVE_TASK':
            return state.filter((t) => t.id !== action.id);
        default:
            return state;
    }
}

interface TaskBoardContextValue {
    tasks: Task[];
    updatePosition: (id: string, status: TaskStatus, position: number) => void;
    addTask: (title: string, status?: TaskStatus) => void;
    removeTask: (id: string) => void
}

const TaskBoardContext = createContext<TaskBoardContextValue | null>(null);

export function TaskBoardProvider({ children }: { children: React.ReactNode }) {
    const [tasks, dispatch] = useReducer(reducer, undefined, seedTasks);

    const updatePosition = useCallback((id: string, status: TaskStatus, position: number) => {
        dispatch({ type: 'UPDATE_POSITION', id, status, position });
    }, []);

    const addTask = useCallback((title: string, status: TaskStatus = 'todo') => {
        const now = new Date().toISOString();
        dispatch({
            type: 'ADD_TASK',
            task: { id: nextId(), title, status, position: 9999, createdAt: now, updatedAt: now},
        });
    }, []);

    const removeTask = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_TASK', id });
    }, []);

    const value = useMemo(
        () => ({ tasks, updatePosition, addTask, removeTask }),
        [tasks, updatePosition, addTask, removeTask]
    );

    return <TaskBoardContext.Provider value={value}>{ children }</TaskBoardContext.Provider>;
}

function useTaskBoardContext() {
  const ctx = useContext(TaskBoardContext);
  if (!ctx) {
    throw new Error('useTaskBoardContext must be used within a TaskBoardProvider');
  }
  return ctx
}

export function useListTask() {
    const { tasks } = useTaskBoardContext();
    return {
        data: { data: tasks },
        isLoading: false,
        isError: false,
    };
}

export function useUpdateTaskPosition() {
  const { updatePosition } = useTaskBoardContext();
  return {
    mutate: ({ id, status, position }: { id: string; status: TaskStatus; position: number }) => {
      updatePosition(id, status, position);
    },
    isPending: false,
  };
}

export function useAddTask() {
  const { addTask } = useTaskBoardContext();
  return {
    mutate: ({ title, status }: { title: string; status?: TaskStatus }) => {
      addTask(title, status);
    },
    isPending: false,
  };
}

export function useRemoveTask() {
  const { removeTask } = useTaskBoardContext();
  return {
    mutate: ({ id }: { id: string }) => {
      removeTask(id);
    },
    isPending: false,
  };
}