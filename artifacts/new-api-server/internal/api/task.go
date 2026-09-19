package api

import (
	"errors"
	"net/http"
	"time"

	db "github.com/bergamo17/aila/db/sqlc"
	"github.com/bergamo17/aila/internal/token"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type createTaskRequest struct {
	SubjectID   int64  `json:"subject_id" binding:"required,min=1"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

type taskResponse struct {
	Id          int64     `json:"id"`
	SubjectId   int64     `json:"subject_id"`
	Title       string    `json:"title"`
	TaskStatus  string    `json:"task_status"`
	Position    int64     `json:"position"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (server *Server) createTask(ctx *gin.Context) {
	var req createTaskRequest

	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	subject, err := server.store.GetSubjectById(ctx, req.SubjectID)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	arg := db.CreateTaskParams{
		UserID:      user.ID,
		SubjectID:   subject.ID,
		Title:       req.Title,
		Description: pgtype.Text{String: req.Description, Valid: true},
	}

	task, err := server.store.CreateTask(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &taskResponse{
		Id:          task.ID,
		SubjectId:   task.SubjectID,
		Title:       task.Title,
		TaskStatus:  task.TaskStatus,
		Position:    task.Position,
		Description: task.Description.String,
		CreatedAt:   task.CreatedAt.Time,
		UpdatedAt:   task.UpdatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

type updateTaskRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

type taskIDUri struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) updateTask(ctx *gin.Context) {
	var uri taskIDUri
	err := ctx.ShouldBindUri(&uri)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	var req updateTaskRequest
	err = ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	arg := db.UpdateTaskParams{
		ID:     uri.ID,
		UserID: user.ID,
		Title:  req.Title,
	}

	updatedTask, err := server.store.UpdateTask(ctx, arg)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("task not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &taskResponse{
		Id:          updatedTask.ID,
		SubjectId:   updatedTask.SubjectID,
		Title:       updatedTask.Title,
		TaskStatus:  updatedTask.TaskStatus,
		Position:    updatedTask.Position,
		Description: updatedTask.Description.String,
		CreatedAt:   updatedTask.CreatedAt.Time,
		UpdatedAt:   updatedTask.UpdatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

type updateTaskStatusRequest struct {
	Position   int64  `json:"position" binding:"required,min=0"`
	TaskStatus string `json:"task_status" binding:"required,oneof='to do' 'in progress' 'done'"`
}

type updateOnlyStatusRequest struct {
	TaskStatus string `json:"task_status" binding:"required,oneof='to do' 'in progress' 'done'"`
}

func (server *Server) updateTaskStatus(ctx *gin.Context) {
	var uri taskIDUri
	err := ctx.ShouldBindUri(&uri)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	var req updateOnlyStatusRequest
	err = ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	task, err := server.store.GetTask(ctx, db.GetTaskParams{
		ID:     uri.ID,
		UserID: user.ID,
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	arg := db.UpdateTaskStatusParams{
		ID:         uri.ID,
		UserID:     task.UserID,
		TaskStatus: req.TaskStatus,
	}

	updatedTask, err := server.store.UpdateTaskStatus(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &taskResponse{
		Id:          updatedTask.ID,
		SubjectId:   updatedTask.SubjectID,
		Title:       updatedTask.Title,
		TaskStatus:  updatedTask.TaskStatus,
		Position:    updatedTask.Position,
		Description: updatedTask.Description.String,
		CreatedAt:   updatedTask.CreatedAt.Time,
		UpdatedAt:   updatedTask.UpdatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) updateTaskStatusAndPosition(ctx *gin.Context) {
	var uri taskIDUri
	err := ctx.ShouldBindUri(&uri)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	var req updateTaskStatusRequest
	err = ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	task, err := server.store.GetTask(ctx, db.GetTaskParams{
		ID:     uri.ID,
		UserID: user.ID,
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	arg := db.UpdateTaskPositionParams{
		ID:         uri.ID,
		UserID:     task.UserID,
		Position:   req.Position,
		TaskStatus: req.TaskStatus,
	}

	updatedTask, err := server.store.UpdateTaskPosition(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &taskResponse{
		Id:          updatedTask.ID,
		SubjectId:   updatedTask.SubjectID,
		Title:       updatedTask.Title,
		TaskStatus:  updatedTask.TaskStatus,
		Position:    updatedTask.Position,
		Description: updatedTask.Description.String,
		CreatedAt:   updatedTask.CreatedAt.Time,
		UpdatedAt:   updatedTask.UpdatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) deleteTask(ctx *gin.Context) {
	var uri taskIDUri
	err := ctx.ShouldBindUri(&uri)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	arg := db.DeleteTaskParams{
		ID:     uri.ID,
		UserID: user.ID,
	}

	err = server.store.DeleteTask(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Task berhasil dihapus"})
}

func (server *Server) listMyTasks(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("User tidak ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	listTask, err := server.store.ListTasksByUser(ctx, user.ID)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Tasks tidak ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := make([]taskResponse, 0, len(listTask))
	for _, t := range listTask {
		result = append(result, taskResponse{
			Id:          t.ID,
			SubjectId:   t.SubjectID,
			Title:       t.Title,
			TaskStatus:  t.TaskStatus,
			Position:    t.Position,
			Description: t.Description.String,
			CreatedAt:   t.CreatedAt.Time,
			UpdatedAt:   t.UpdatedAt.Time,
		})
	}

	ctx.JSON(http.StatusOK, result)
}
