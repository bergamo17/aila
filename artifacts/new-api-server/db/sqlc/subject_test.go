package db

import (
	"context"
	"testing"

	"github.com/bergamo17/aila/internal/util"
	"github.com/stretchr/testify/require"
)

func createRandomSubject(t *testing.T) Subject {
	user := createRandomUser(t)

	arg := CreateSubjectParams{
		UserID:      user.ID,
		SubjectName: util.RandomString(8),
	}

	subject, err := testQueries.CreateSubject(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, subject)

	require.Equal(t, subject.SubjectName, arg.SubjectName)
	require.Equal(t, subject.UserID, arg.UserID)

	require.NotZero(t, subject.CreatedAt)

	return subject
}

func TestCreateSubject(t *testing.T) {
	createRandomSubject(t)
}

func TestGetSubjectById(t *testing.T) {
	subject := createRandomSubject(t)

	result, err := testQueries.GetSubjectById(context.Background(), subject.ID)
	require.NoError(t, err)
	require.NotEmpty(t, result)
	require.Equal(t, subject.ID, result.ID)
	require.Equal(t, subject.SubjectName, result.SubjectName)
	require.Equal(t, subject.UserID, result.UserID)
	// require.WithinDuration(t, subject.CreatedAt.Time, result.CreatedAt.Time, time.Second)
}

func TestListSubjectByUser(t *testing.T) {
	user := createRandomUser(t)
	otherUser := createRandomUser(t)

	var lastSubject Subject
	n := 5
	for i := 0; i < n; i++ {
		arg := CreateSubjectParams{
			UserID:      user.ID,
			SubjectName: util.RandomString(6),
		}
		subject, err := testQueries.CreateSubject(context.Background(), arg)
		require.NoError(t, err)
		require.NotEmpty(t, subject)
		lastSubject = subject
	}

	_, err := testQueries.CreateSubject(context.Background(), CreateSubjectParams{
		UserID:      otherUser.ID,
		SubjectName: util.RandomString(6),
	})
	require.NoError(t, err)

	allSubject, err := testQueries.ListSubjectByUser(context.Background(), user.ID)
	require.NoError(t, err)
	require.Len(t, allSubject, n)

	found := false
	for _, subject := range allSubject {
		if subject.ID == lastSubject.ID {
			found = true
			require.Equal(t, lastSubject.SubjectName, subject.SubjectName)
			break
		}
	}
	require.True(t, found)
}

func TestUpdateSubject(t *testing.T) {
	subject := createRandomSubject(t)
	require.NotEmpty(t, subject)

	arg := UpdateSubjectParams{
		ID:          subject.ID,
		UserID:      subject.UserID,
		SubjectName: "test",
		Color:       "blue",
	}

	updatedSubject, err := testQueries.UpdateSubject(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, updatedSubject)

	require.Equal(t, updatedSubject.ID, subject.ID)
	require.Equal(t, updatedSubject.UserID, subject.UserID)

	require.NotEqual(t, updatedSubject.SubjectName, subject.SubjectName)
	require.NotEqual(t, updatedSubject.Color, subject.Color)
}
