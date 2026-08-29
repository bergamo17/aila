-- name: CreateTask :one
INSERT INTO tasks (
    user_id, subject_id, title
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: GetTask :one
SELECT * FROM tasks
WHERE id = $1 AND user_id = $2
LIMIT 1;

-- name: ListTaskByStatus :many
SELECT * FROM tasks
WHERE user_id = $1 AND task_status = $2
ORDER BY created_at DESC;

-- name: ListTaskByUser :many
SELECT * FROM tasks
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: ListTaskBySubject :many
SELECT * FROM tasks
WHERE subject_id = $1 AND user_id = $2
ORDER BY created_at DESC;

-- name: UpdateTask :one
UPDATE tasks
SET title = $3, updated_at = now()
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: UpdateTaskStatus :one
UPDATE tasks
SET task_status = $3, updated_at = now()
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteTask :exec
DELETE FROM tasks
WHERE id = $1 AND user_id = $2;