-- name: CreateSubject :one
INSERT INTO subjects (
    user_id, subject_name, color
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: ListSubjectByUser :many
SELECT s.*, COUNT(n.id) AS notes_count
FROM subjects AS s
LEFT JOIN notes n ON n.subject_id = s.id
WHERE s.user_id = $1
GROUP BY s.id
ORDER BY s.created_at DESC;

-- name: GetSubjectById :one
SELECT id, user_id, subject_name, created_at, color, updated_at
FROM subjects
WHERE id = $1
LIMIT 1;

-- name: UpdateSubject :one
UPDATE subjects
SET subject_name = $3, color = $4, updated_at = now()
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteSubject :exec
DELETE FROM subjects
WHERE id = $1 AND user_id = $2;