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

type noteResponse struct {
	Id        int64     `json:"id"`
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

	result := &noteResponse{
		Id:        note.ID,
		SubjectId: note.SubjectID,
		Title:     note.Title,
		Content:   note.Content.String,
		CreatedAt: note.CreatedAt.Time,
	}

	ctx.JSON(http.StatusOK, result)
}

type noteUri struct {
	Id int64 `json:"id" binding:"required,min=1"`
}

func (server *Server) getNoteById(ctx *gin.Context) {
	var uri noteUri

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

	arg := db.GetNoteParams{
		ID:     uri.Id,
		UserID: user.ID,
	}

	result, err := server.store.GetNote(ctx, arg)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Note tidak ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, &noteResponse{
		Id:        result.ID,
		SubjectId: result.SubjectID,
		Title:     result.Title,
		Content:   result.Content.String,
		CreatedAt: result.CreatedAt.Time,
	})

}

func (server *Server) deleteNote(ctx *gin.Context) {
	var uri noteUri

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

	arg := db.DeleteNoteParams{
		ID:     uri.Id,
		UserID: user.ID,
	}

	err = server.store.DeleteNote(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Note berhasil dihapus"})
}

type listNoteBySubjectRequest struct {
	SubjectId int64 `json:"subject_id"`
}

func (server *Server) listNoteBySubject(ctx *gin.Context) {
	var req listNoteBySubjectRequest

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

	arg := db.ListNotesBySubjectParams{
		SubjectID: req.SubjectId,
		UserID:    user.ID,
	}

	listNote, err := server.store.ListNotesBySubject(ctx, arg)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Tidak ada catatan yang ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := make([]noteResponse, 0, len(listNote))
	for _, n := range listNote {
		result = append(result, noteResponse{
			Id:        n.ID,
			SubjectId: n.SubjectID,
			Title:     n.Title,
			Content:   n.Content.String,
			CreatedAt: n.CreatedAt.Time,
		})
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) listNotesByUser(ctx *gin.Context) {
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

	listNote, err := server.store.ListNotesByUser(ctx, user.ID)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Tidak ada catatan yang ditemukan")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := make([]noteResponse, 0, len(listNote))
	for _, n := range listNote {
		result = append(result, noteResponse{
			Id:        n.ID,
			SubjectId: n.SubjectID,
			Title:     n.Title,
			Content:   n.Content.String,
			CreatedAt: n.CreatedAt.Time,
		})
	}

	ctx.JSON(http.StatusOK, result)
}
