package db

import (
	"context"
	"testing"
	"time"

	"github.com/bergamo17/aila/internal/util"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/require"
)

func createRandomNote(t *testing.T) (Note, Subject) {
	subject := createRandomSubject(t)

	arg := CreateNoteParams{
		SubjectID: subject.ID,
		Title:     util.RandomString(12),
		Content: pgtype.Text{
			String: util.RandomString(12),
			Valid:  true,
		},
	}

	note, err := testQueries.CreateNote(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, note)

	require.Equal(t, note.SubjectID, subject.ID)
	require.Equal(t, note.Title, arg.Title)
	require.Equal(t, note.Content, arg.Content)
	require.NotZero(t, note.CreatedAt)

	return note, subject
}

func TestCreateNote(t *testing.T) {
	_, _ = createRandomNote(t)
}

func TestGetNote(t *testing.T) {
	note1, subject := createRandomNote(t)

	arg := GetNoteParams{
		ID:     note1.ID,
		UserID: subject.UserID,
	}

	note2, err := testQueries.GetNote(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, note2)

	require.Equal(t, note2.ID, note1.ID)
	require.Equal(t, note2.SubjectID, note2.SubjectID)
	require.Equal(t, note2.Content, note1.Content)

	require.WithinDuration(t, note1.CreatedAt.Time, note2.CreatedAt.Time, time.Second)
}

func TestListNotesBySubject(t *testing.T) {
	subject := createRandomSubject(t)
	otherSubject := createRandomSubject(t)

	var lastNote Note
	n := 5
	for i := 0; i < n; i++ {
		arg := CreateNoteParams{
			SubjectID: subject.ID,
			Content: pgtype.Text{
				String: util.RandomString(12),
				Valid:  true,
			},
		}
		note, err := testQueries.CreateNote(context.Background(), arg)
		require.NoError(t, err)
		require.NotEmpty(t, note)
		lastNote = note
	}

	_, err := testQueries.CreateNote(context.Background(), CreateNoteParams{
		SubjectID: otherSubject.ID,
		Content: pgtype.Text{
			String: util.RandomString(12),
			Valid:  true,
		},
	})
	require.NoError(t, err)

	arg := ListNotesBySubjectParams{
		SubjectID: subject.ID,
		UserID:    subject.UserID,
	}

	allNote, err := testQueries.ListNotesBySubject(context.Background(), arg)
	require.NoError(t, err)
	require.Len(t, allNote, n)

	found := false
	for _, note := range allNote {
		if note.ID == lastNote.ID {
			found = true
			require.Equal(t, lastNote.Content, note.Content)
			break
		}
	}
	require.True(t, found)
}

func TestListListNotesByUser(t *testing.T) {
	subject := createRandomSubject(t)
	otherSubject := createRandomSubject(t)

	var lastNote Note
	n := 5
	for i := 0; i < n; i++ {
		arg := CreateNoteParams{
			SubjectID: subject.ID,
			Content: pgtype.Text{
				String: util.RandomString(12),
				Valid:  true,
			},
		}
		note, err := testQueries.CreateNote(context.Background(), arg)
		require.NoError(t, err)
		require.NotEmpty(t, note)
		lastNote = note
	}

	_, err := testQueries.CreateNote(context.Background(), CreateNoteParams{
		SubjectID: otherSubject.ID,
		Content: pgtype.Text{
			String: util.RandomString(12),
			Valid:  true,
		},
	})
	require.NoError(t, err)

	allNote, err := testQueries.ListNotesByUser(context.Background(), subject.UserID)
	require.NoError(t, err)
	require.Len(t, allNote, n)

	found := false
	for _, note := range allNote {
		if note.ID == lastNote.ID {
			found = true
			require.Equal(t, lastNote.Content, note.Content)
			break
		}
	}
	require.True(t, found)
}

func TestUpdateNote(t *testing.T) {
	note, subject := createRandomNote(t)

	arg := UpdateNoteParams{
		ID:     note.ID,
		UserID: subject.UserID,
		Content: pgtype.Text{
			String: "This is an update",
			Valid:  true,
		},
	}

	newNote, err := testQueries.UpdateNote(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, newNote)
	require.NotEqual(t, note.UpdatedAt, newNote.UpdatedAt)
	require.True(t, newNote.UpdatedAt.Time.After(note.UpdatedAt.Time))
}

func TestDeleteNote(t *testing.T) {
	note, subject := createRandomNote(t)

	arg := DeleteNoteParams{
		ID:     note.ID,
		UserID: subject.UserID,
	}

	err := testQueries.DeleteNote(context.Background(), arg)
	require.NoError(t, err)

	deletedNote, err := testQueries.GetNote(context.Background(), GetNoteParams{
		ID:     note.ID,
		UserID: subject.UserID,
	})
	require.Error(t, err)
	require.EqualError(t, err, pgx.ErrNoRows.Error())
	require.Empty(t, deletedNote)
}
