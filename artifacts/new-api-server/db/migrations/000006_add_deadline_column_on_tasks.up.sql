ALTER TABLE "tasks" ADD COLUMN "deadline" TIMESTAMPTZ;

CREATE UNIQUE INDEX idx_schedules_task_id_uniqu
    ON schedules(task_id) WHERE task_id IS NOT NULL;

ALTER TABLE schedules DROP CONSTRAINT schedules_task_id_fkey;
ALTER TABLE schedules ADD CONSTRAINT scheduler_task_id_fkey
    FOREIGN KEY (task_id) REFERENCES tasks(id)
    ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;