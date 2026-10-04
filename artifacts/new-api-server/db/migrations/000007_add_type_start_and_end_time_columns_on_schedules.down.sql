ALTER TABLE schedules DROP CONSTRAINT schedules_type_check;
ALTER TABLE schedules DROP COLUMN type;

ALTER TABLE schedules DROP COLUMN end_time;
ALTER TABLE schedules DROP COLUMN start_time;
