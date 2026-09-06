package api

import (
	"errors"
	"net/http"
	"time"

	db "github.com/bergamo17/aila/db/sqlc"
	"github.com/bergamo17/aila/internal/token"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type createTaskRequest struct {
	SubjectID int64  `json:"subject_id" binding:"required,min=1"`
	Title     string `json:"title" binding:"required"`
}

type createTaskResponse struct {
	SubjectID  int64  `json:"subject_id"`
	TaskStatus string `json:"subject_name"`
	Title      string `json:"title"`
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
		UserID:    user.ID,
		SubjectID: subject.ID,
		Title:     req.Title,
	}

	task, err := server.store.CreateTask(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &createTaskResponse{
		SubjectID:  task.SubjectID,
		TaskStatus: task.TaskStatus,
		Title:      task.Title,
	}

	ctx.JSON(http.StatusOK, result)
}

type updateTaskRequest struct {
	Title string `json:"title" binding:"required"`
}

type taskIDUri struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

type updateTaskResponse struct {
	Title      string    `json:"title"`
	TaskStatus string    `json:"task_status"`
	UpdatedAt  time.Time `json:"updated_at"`
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

	result := &updateTaskResponse{
		Title:      updatedTask.Title,
		TaskStatus: updatedTask.TaskStatus,
		UpdatedAt:  updatedTask.UpdatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

type updateTaskStatusRequest struct {
	TaskStatus string `json:"task_status" binding:"required,oneof='to do' 'in progress' 'done'"`
}

func (server *Server) updateTaskStatus(ctx *gin.Context) {
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

	result := &updateTaskResponse{
		Title:      updatedTask.Title,
		TaskStatus: updatedTask.TaskStatus,
		UpdatedAt:  updatedTask.UpdatedAt.Time,
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

	ctx.JSON(http.StatusOK, nil)
}
