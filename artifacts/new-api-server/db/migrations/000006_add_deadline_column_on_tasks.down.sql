ALTER TABLE schedules DROP CONSTRAINT schedules_task_id_fkey;
ALTER TABLE schedules ADD CONSTRAINT schedules_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES tasks(id)
  DEFERRABLE INITIALLY IMMEDIATE;

DROP INDEX IF EXISTS idx_schedules_task_id_unique;

ALTER TABLE tasks DROP COLUMN deadline;