package api

import (
	"net/http"
	"time"

	db "github.com/bergamo17/aila/db/sqlc"
	"github.com/bergamo17/aila/internal/token"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type createSubjectRequest struct {
	SubjectName string `json:"subject_name" binding:"required"`
}

type createSubjectResponse struct {
	SubjectName string    `json:"subject_name"`
	CreatedAt   time.Time `json:"created_at"`
}

func (server *Server) createSubject(ctx *gin.Context) {
	var req createSubjectRequest

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

	arg := db.CreateSubjectParams{
		UserID:      user.ID,
		SubjectName: req.SubjectName,
	}

	subject, err := server.store.CreateSubject(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &createSubjectResponse{
		SubjectName: subject.SubjectName,
		CreatedAt:   subject.CreatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}
