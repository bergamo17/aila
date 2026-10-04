-- name: CreateSchedule :one
INSERT INTO schedules (user_id, subject_id, task_id, title, event_date, reminder, type, start_time, end_time)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: GetScheduleById :one
SELECT * FROM schedules
WHERE id = $1 AND user_id = $2
LIMIT 1;

-- name: ListScheduleByUserAndDateRange :many
SELECT * FROM schedules
WHERE user_id = $1 
    AND event_date BETWEEN $2 AND $3
ORDER BY event_date ASC;

-- name: ListScheduleByDate :many
SELECT * FROM schedules
WHERE user_id = $1 AND event_date = $2
ORDER BY created_at ASC;

-- name: ListUpcomingSchedule :many
SELECT * FROM schedules
WHERE user_id = $1 AND event_date >= $2
ORDER BY event_date ASC
LIMIT 3;

-- name: UpdateSchedule :one
UPDATE schedules
SET subject_id = $3,
    task_id = $4,
    title = $5,
    event_date = $6,
    start_time = $7,
    end_time = $8,
    type = $9,
    reminder = $10
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: UpdateScheduleStatus :one
UPDATE schedules
SET is_completed = $3
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteSchedule :exec
DELETE FROM schedules
WHERE id = $1 AND user_id = $2;