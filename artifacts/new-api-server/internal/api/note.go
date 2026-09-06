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

type createNoteRequest struct {
	SubjectId int64  `json:"subject_id" binding:"required,min=1"`
	Title     string `json:"title" binding:"required"`
	Content   string `json:"content"`
}

type newNoteResponse struct {
	SubjectId int64     `json:"subject_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func (server *Server) createNote(ctx *gin.Context) {
	var req createNoteRequest
	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

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

	subject, err := server.store.GetSubjectById(ctx, req.SubjectId)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Mata Kuliah tidak ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	if subject.UserID != user.ID {
		ctx.JSON(http.StatusForbidden, errResponse(errors.New("Anda tidak memiliki akses ke mata kuliah ini")))
		return
	}

	arg := db.CreateNoteParams{
		SubjectID: subject.ID,
		Title:     req.Title,
		Content:   pgtype.Text{String: req.Content, Valid: true},
	}

	note, err := server.store.CreateNote(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &newNoteResponse{
		SubjectId: note.SubjectID,
		Title:     note.Title,
		Content:   note.Content.String,
		CreatedAt: note.CreatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}
