import apiFetch from "@/lib/api";
import type { Note, CreateNoteRequest, NewNote } from "@/types/note";
import { X } from "lucide-react";

export const noteApi = {
    create: async (payload: CreateNoteRequest): Promise<NewNote> => {
        return await apiFetch("/note/create", {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify(payload),
        })
    }
}