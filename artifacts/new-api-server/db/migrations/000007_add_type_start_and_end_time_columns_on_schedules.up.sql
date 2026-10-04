ALTER TABLE schedules ADD COLUMN type TEXT NOT NULL DEFAULT 'reminder';
ALTER TABLE schedules ADD CONSTRAINT schedule_type_check
    CHECK (type IN ('task', 'exam', 'study_session', 'reminder'));

ALTER TABLE schedules ADD COLUMN start_time TIME;
ALTER TABLE schedules ADD COLUMN end_time TIME;