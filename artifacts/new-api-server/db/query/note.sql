-- name: CreateNote :one
INSERT INTO notes (
    subject_id, title, content
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: GetNote :one
SELECT n.* 
FROM notes n
JOIN subjects s ON s.id = n.subject_id
WHERE n.id = $1 AND s.user_id = $2 
LIMIT 1;

-- name: ListNotesByUser :many
SELECT n.*
FROM notes n
JOIN subjects s ON s.id = n.subject_id
WHERE s.user_id = $1
ORDER BY n.created_at DESC;

-- name: ListNotesBySubject :many
SELECT n.*
FROM notes n
JOIN subjects s ON s.id = n.subject_id
WHERE n.subject_id = $1 AND s.user_id = $2
ORDER BY n.created_at DESC;

-- name: UpdateNote :one
UPDATE notes n
SET content = $3, updated_at = clock_timestamp()
WHERE n.id = $1
    AND subject_id IN (
        SELECT id FROM subjects WHERE user_id = $2
    )
RETURNING *;

-- name: DeleteNote :exec
DELETE FROM notes n
WHERE n.id = $1
    AND subject_id IN (
        SELECT id FROM subjects WHERE user_id = $2
    );