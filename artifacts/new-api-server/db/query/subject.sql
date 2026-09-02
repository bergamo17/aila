-- name: CreateSubject :one
INSERT INTO subjects (
    user_id, subject_name
) VALUES (
    $1, $2
) RETURNING *;

-- name: ListSubjectByUser :many
SELECT s.*, COUNT(n.id) AS notes_count
FROM subjects AS s
LEFT JOIN notes n ON n.subject_id = s.id
WHERE s.user_id = $1
GROUP BY s.id
ORDER BY s.created_at DESC;

-- name: GetSubjectById :one
SELECT id, user_id, subject_name, created_at
FROM subjects
WHERE id = $1
LIMIT 1;