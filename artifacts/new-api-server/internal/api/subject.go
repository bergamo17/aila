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

type createSubjectRequest struct {
	SubjectName string `json:"subject_name" binding:"required"`
	Color       string `json:"color" binding:"required"`
}

type subjectResponse struct {
	Id          int64     `json:"id"`
	SubjectName string    `json:"subject_name"`
	Color       string    `json:"color"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
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
		Color:       req.Color,
	}

	subject, err := server.store.CreateSubject(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &subjectResponse{
		Id:          subject.ID,
		SubjectName: subject.SubjectName,
		Color:       subject.Color,
		CreatedAt:   subject.CreatedAt.Time,
		UpdatedAt:   subject.UpdatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

type subjectUri struct {
	Id int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) getSubjectById(ctx *gin.Context) {
	var uri subjectUri
	err := ctx.ShouldBindUri(&uri)
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

	subject, err := server.store.GetSubjectById(ctx, uri.Id)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Mata kuliah tidak ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	if subject.UserID != user.ID {
		ctx.JSON(http.StatusForbidden, errResponse(errors.New("Anda tidak memiliki akses ke mata kuliah ini")))
		return
	}

	result := &subjectResponse{
		Id:          subject.ID,
		SubjectName: subject.SubjectName,
		Color:       subject.Color,
		CreatedAt:   subject.CreatedAt.Time,
		UpdatedAt:   subject.UpdatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

type subjectWithNotesCountResponse struct {
	subjectResponse
	NotesCount int64 `json:"notes_count"`
}

func (server *Server) listSubjectByUser(ctx *gin.Context) {
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

	listSubject, err := server.store.ListSubjectByUser(ctx, user.ID)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Tidak ada mata kuliah ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := make([]subjectWithNotesCountResponse, 0, len(listSubject))
	for _, s := range listSubject {
		result = append(result, subjectWithNotesCountResponse{
			subjectResponse: subjectResponse{
				Id:          s.ID,
				SubjectName: s.SubjectName,
				Color:       s.Color,
				CreatedAt:   s.CreatedAt.Time,
				UpdatedAt:   s.UpdatedAt.Time,
			},
			NotesCount: s.NotesCount,
		})
	}

	ctx.JSON(http.StatusOK, result)
}
