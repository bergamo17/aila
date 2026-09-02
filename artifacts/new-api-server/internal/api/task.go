package api

import (
	"net/http"

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
