package db

import (
	"context"
	"testing"
	"time"

	"github.com/bergamo17/aila/internal/util"
	"github.com/stretchr/testify/require"
)

func createRandomTask(t *testing.T) Task {
	subject := createRandomSubject(t)

	arg := CreateTaskParams{
		UserID:    subject.UserID,
		SubjectID: subject.ID,
		Title:     util.RandomString(12),
	}

	task, err := testQueries.CreateTask(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, task)

	require.Equal(t, task.UserID, subject.UserID)
	require.Equal(t, task.SubjectID, subject.ID)

	return task
}

func TestCreateTask(t *testing.T) {
	createRandomTask(t)
}

func TestGetTaks(t *testing.T) {
	task := createRandomTask(t)

	arg := GetTaskParams{
		ID:     task.ID,
		UserID: task.UserID,
	}

	newTask, err := testQueries.GetTask(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, newTask)

	require.Equal(t, newTask.ID, task.ID)
	require.Equal(t, newTask.SubjectID, task.SubjectID)
	require.Equal(t, newTask.UserID, task.UserID)
	require.Equal(t, newTask.Title, task.Title)
	require.Equal(t, newTask.TaskStatus, task.TaskStatus)

	require.WithinDuration(t, newTask.CreatedAt.Time, task.CreatedAt.Time, time.Second)
}

func updateRandomTaskStatus(t *testing.T) Task {
	task := createRandomTask(t)

	arg := UpdateTaskStatusParams{
		ID:         task.ID,
		UserID:     task.UserID,
		TaskStatus: util.RandomTaskStatus(),
	}

	updatedTask, err := testQueries.UpdateTaskStatus(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, updatedTask)

	require.Equal(t, task.ID, updatedTask.ID)
	require.Equal(t, task.SubjectID, updatedTask.SubjectID)
	require.Equal(t, task.UserID, updatedTask.UserID)
	require.Equal(t, task.Title, updatedTask.Title)

	return updatedTask
}

func TestUpdateTaskStatus(t *testing.T) {
	updateRandomTaskStatus(t)
}

func TestListTaskByUser(t *testing.T) {
	hashedPassword1, err := util.HashPassword(util.RandomString(8))
	require.NoError(t, err)
	require.NotEmpty(t, hashedPassword1)

	user1, err := testQueries.CreateUser(context.Background(), CreateUserParams{
		Username:       util.RandomString(6),
		HashedPassword: hashedPassword1,
		Fullname:       util.RandomString(12),
		Email:          util.RandomEmail(),
	})
	require.NoError(t, err)
	require.NotEmpty(t, user1)

	hashedPassword2, err := util.HashPassword(util.RandomString(8))
	require.NoError(t, err)
	require.NotEmpty(t, hashedPassword2)

	user2, err := testQueries.CreateUser(context.Background(), CreateUserParams{
		Username:       util.RandomString(6),
		HashedPassword: hashedPassword2,
		Fullname:       util.RandomString(12),
		Email:          util.RandomEmail(),
	})
	require.NoError(t, err)
	require.NotEmpty(t, user2)

	subject1, err := testQueries.CreateSubject(context.Background(), CreateSubjectParams{
		UserID:      user1.ID,
		SubjectName: util.RandomString(8),
	})
	require.NoError(t, err)
	require.NotEmpty(t, subject1)

	subject2, err := testQueries.CreateSubject(context.Background(), CreateSubjectParams{
		UserID:      user2.ID,
		SubjectName: util.RandomString(8),
	})
	require.NoError(t, err)
	require.NotEmpty(t, subject2)

	n := 5
	userTask1 := []Task{}
	userTask2 := []Task{}

	for i := 0; i < n; i++ {
		task1, err := testQueries.CreateTask(context.Background(), CreateTaskParams{
			UserID:    user1.ID,
			SubjectID: subject1.ID,
			Title:     util.RandomString(6),
		})
		require.NoError(t, err)
		require.NotEmpty(t, task1)

		task2, err := testQueries.CreateTask(context.Background(), CreateTaskParams{
			UserID:    user2.ID,
			SubjectID: subject2.ID,
			Title:     util.RandomString(6),
		})
		require.NoError(t, err)
		require.NotEmpty(t, task2)

		userTask1 = append(userTask1, task1)
		userTask2 = append(userTask2, task2)
	}

	listTaskByUser1, err := testQueries.ListTaskByUser(context.Background(), user1.ID)
	require.NoError(t, err)
	require.NotEmpty(t, listTaskByUser1)
	require.Len(t, listTaskByUser1, len(userTask1))
	require.ElementsMatch(t, listTaskByUser1, userTask1)

	m := len(userTask1) - 1

	for i := range listTaskByUser1 {
		require.Equal(t, listTaskByUser1[i].ID, userTask1[m-i].ID)
		require.Equal(t, listTaskByUser1[i].SubjectID, userTask1[m-i].SubjectID)
		require.Equal(t, listTaskByUser1[i].TaskStatus, userTask1[m-i].TaskStatus)
		require.Equal(t, listTaskByUser1[i].Title, userTask1[m-i].Title)
		require.WithinDuration(t, listTaskByUser1[i].CreatedAt.Time, userTask1[m-i].CreatedAt.Time, time.Second)
		require.WithinDuration(t, listTaskByUser1[i].UpdatedAt.Time, userTask1[m-i].UpdatedAt.Time, time.Second)
	}

	listTaskByUser2, err := testQueries.ListTaskByUser(context.Background(), user2.ID)
	require.NoError(t, err)
	require.NotEmpty(t, listTaskByUser2)
	require.Len(t, listTaskByUser2, len(userTask2))
	require.ElementsMatch(t, listTaskByUser2, userTask2)

	p := len(listTaskByUser2) - 1
	for i := range listTaskByUser2 {
		require.NotEqual(t, listTaskByUser2[i].ID, listTaskByUser1[p-i].ID)
		require.NotEqual(t, listTaskByUser2[i].SubjectID, listTaskByUser1[p-i].SubjectID)
		// require.NotEqual(t, listTaskByUser2[i].TaskStatus, listTaskByUser1[p-i].TaskStatus)
		require.NotEqual(t, listTaskByUser2[i].Title, listTaskByUser1[p-i].Title)
	}

}

func TestListTaskBySubject(t *testing.T) {
	user1 := createRandomUser(t)
	user2 := createRandomUser(t)

	firstUserSubjects := []Subject{}
	for i := 0; i < 2; i++ {
		subject, err := testQueries.CreateSubject(context.Background(), CreateSubjectParams{
			UserID:      user1.ID,
			SubjectName: util.RandomString(8),
		})
		require.NoError(t, err)
		require.NotEmpty(t, subject)

		firstUserSubjects = append(firstUserSubjects, subject)
	}

	secondUserSubject, err := testQueries.CreateSubject(context.Background(), CreateSubjectParams{
		UserID:      user2.ID,
		SubjectName: util.RandomString(6),
	})
	require.NoError(t, err)
	require.NotEmpty(t, secondUserSubject)

	n := 5

	// Simpan task per subject (urutan pembuatan) agar mudah dibandingkan
	firstUserTasksBySubject := make(map[int64][]Task)
	for _, subject := range firstUserSubjects {
		tasks := []Task{}
		for j := 0; j < n; j++ {
			task, err := testQueries.CreateTask(context.Background(), CreateTaskParams{
				UserID:    user1.ID,
				SubjectID: subject.ID,
				Title:     util.RandomString(6),
			})
			require.NoError(t, err)
			require.NotEmpty(t, task)

			tasks = append(tasks, task)
		}
		firstUserTasksBySubject[subject.ID] = tasks
	}

	secondUserTask := []Task{}
	for i := 0; i < n; i++ {
		task, err := testQueries.CreateTask(context.Background(), CreateTaskParams{
			UserID:    user2.ID,
			SubjectID: secondUserSubject.ID,
			Title:     util.RandomString(6),
		})
		require.NoError(t, err)
		require.NotEmpty(t, task)

		secondUserTask = append(secondUserTask, task)
	}

	// Cek tiap subject milik user1 SATU KALI query, bukan diulang n kali
	for _, subject := range firstUserSubjects {
		listTask, err := testQueries.ListTaskBySubject(context.Background(), ListTaskBySubjectParams{
			SubjectID: subject.ID,
			UserID:    user1.ID,
		})
		require.NoError(t, err)
		require.NotEmpty(t, listTask)

		expected := firstUserTasksBySubject[subject.ID]
		require.Len(t, listTask, len(expected))

		// Hasil query terurut created_at DESC -> task terbaru duluan,
		// jadi expected harus dibalik urutannya
		for i := range listTask {
			exp := expected[len(expected)-1-i]
			require.Equal(t, exp.ID, listTask[i].ID)
			require.Equal(t, exp.SubjectID, listTask[i].SubjectID)
			require.Equal(t, exp.TaskStatus, listTask[i].TaskStatus)
			require.Equal(t, exp.Title, listTask[i].Title)
			require.WithinDuration(t, exp.CreatedAt.Time, listTask[i].CreatedAt.Time, time.Second)
		}
	}

	// Cek subject milik user2
	listTask2, err := testQueries.ListTaskBySubject(context.Background(), ListTaskBySubjectParams{
		SubjectID: secondUserSubject.ID,
		UserID:    user2.ID,
	})
	require.NoError(t, err)
	require.NotEmpty(t, listTask2)
	require.Len(t, listTask2, len(secondUserTask))

	for i := range listTask2 {
		exp := secondUserTask[len(secondUserTask)-1-i]
		require.Equal(t, exp.ID, listTask2[i].ID)
		require.Equal(t, exp.SubjectID, listTask2[i].SubjectID)
		require.Equal(t, exp.TaskStatus, listTask2[i].TaskStatus)
		require.Equal(t, exp.Title, listTask2[i].Title)
	}

	// Isolasi antar user: subject milik user1 tidak boleh muncul saat
	// query pakai UserID user2 (memastikan query benar-benar filter by owner)
	crossQuery, err := testQueries.ListTaskBySubject(context.Background(), ListTaskBySubjectParams{
		SubjectID: firstUserSubjects[0].ID,
		UserID:    user2.ID,
	})
	require.NoError(t, err)
	require.Empty(t, crossQuery)
}

func TestListTaskByStatus(t *testing.T) {
	hashedPassword, err := util.HashPassword(util.RandomString(8))
	require.NoError(t, err)
	require.NotEmpty(t, hashedPassword)

	argUser := CreateUserParams{
		Username:       util.RandomString(8),
		HashedPassword: hashedPassword,
		Fullname:       util.RandomString(12),
		Email:          util.RandomEmail(),
	}

	user, err := testQueries.CreateUser(context.Background(), argUser)
	require.NoError(t, err)
	require.NotEmpty(t, user)

	argSubject := CreateSubjectParams{
		UserID:      user.ID,
		SubjectName: util.RandomString(8),
	}

	subject, err := testQueries.CreateSubject(context.Background(), argSubject)
	require.NoError(t, err)
	require.NotEmpty(t, subject)

	var tasks []Task
	n := 5
	for i := 0; i < n; i++ {
		argTask := CreateTaskParams{
			UserID:    user.ID,
			SubjectID: subject.ID,
			Title:     util.RandomString(4),
		}
		task, err := testQueries.CreateTask(context.Background(), argTask)
		require.NoError(t, err)
		require.NotEmpty(t, task)
		tasks = append(tasks, task)
	}

	statuses := []string{"to do", "in progress", "in progress", "done", "done"}
	for i := 0; i < len(tasks); i++ {
		arg := UpdateTaskStatusParams{
			ID:         tasks[i].ID,
			UserID:     tasks[i].UserID,
			TaskStatus: statuses[i],
		}
		tasks[i], err = testQueries.UpdateTaskStatus(context.Background(), arg)
		require.NoError(t, err)
		require.NotEmpty(t, tasks[i])
	}

	hashedPassword2, err := util.HashPassword(util.RandomString(8))
	require.NoError(t, err)
	require.NotEmpty(t, hashedPassword2)

	argOtherUser := CreateUserParams{
		Username:       util.RandomString(8),
		HashedPassword: hashedPassword2,
		Fullname:       util.RandomString(12),
		Email:          util.RandomEmail(),
	}

	otherUser, err := testQueries.CreateUser(context.Background(), argOtherUser)
	require.NoError(t, err)
	require.NotEmpty(t, otherUser)

	argOtherSubject := CreateSubjectParams{
		UserID:      otherUser.ID,
		SubjectName: util.RandomString(8),
	}

	otherSubject, err := testQueries.CreateSubject(context.Background(), argOtherSubject)
	require.NoError(t, err)
	require.NotEmpty(t, otherSubject)

	otherTask, err := testQueries.CreateTask(context.Background(), CreateTaskParams{
		UserID:    otherUser.ID,
		SubjectID: otherSubject.ID,
		Title:     util.RandomString(12),
	})
	require.NoError(t, err)

	otherTask, err = testQueries.UpdateTaskStatus(context.Background(), UpdateTaskStatusParams{
		ID:         otherTask.ID,
		UserID:     otherUser.ID,
		TaskStatus: "done",
	})
	require.NoError(t, err)
	require.NotEmpty(t, otherTask)

	var expectedDoneTask []Task
	for i, status := range statuses {
		if status == "done" {
			expectedDoneTask = append(expectedDoneTask, tasks[i])
		}
	}

	argDoneTaskStatus := ListTaskByStatusParams{
		UserID:     user.ID,
		TaskStatus: "done",
	}

	doneTaskStatus, err := testQueries.ListTaskByStatus(context.Background(), argDoneTaskStatus)
	require.NoError(t, err)
	require.Len(t, doneTaskStatus, len(expectedDoneTask))

	var actualDoneTaskStatus []Task
	for _, task := range doneTaskStatus {
		require.Equal(t, "done", task.TaskStatus)
		require.Equal(t, user.ID, task.UserID)
		actualDoneTaskStatus = append(actualDoneTaskStatus, task)
	}

	require.ElementsMatch(t, expectedDoneTask, actualDoneTaskStatus)

	for _, task := range doneTaskStatus {
		require.NotEqual(t, otherTask.ID, task.ID)
	}

	argListNone := ListTaskByStatusParams{
		UserID:     user.ID,
		TaskStatus: "cancelled",
	}

	noneTask, err := testQueries.ListTaskByStatus(context.Background(), argListNone)
	require.NoError(t, err)
	require.Empty(t, noneTask)
}
