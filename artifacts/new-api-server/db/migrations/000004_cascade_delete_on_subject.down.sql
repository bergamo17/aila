ALTER TABLE "notes" DROP CONSTRAINT "notes_subject_id_fkey";
ALTER TABLE "notes" ADD CONSTRAINT "notes_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "note_attachments" DROP CONSTRAINT "note_attachments_notes_id_fkey";
ALTER TABLE "note_attachments" ADD CONSTRAINT "note_attachments_notes_id_fkey"
    FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tasks" DROP CONSTRAINT "tasks_subject_id_fkey";
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "schedules" DROP CONSTRAINT "schedules_subject_id_fkey";
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "schedules" DROP CONSTRAINT "schedules_task_id_fkey";
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_task_id_fkey"
    FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") DEFERRABLE INITIALLY IMMEDIATE;