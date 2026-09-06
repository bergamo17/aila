package api

import (
	"errors"
	"net/http"
	"time"

	db "github.com/bergamo17/aila/db/sqlc"
	"github.com/bergamo17/aila/internal/token"
	"github.com/bergamo17/aila/internal/util"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

type createUserRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
	Fullname string `json:"fullname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

type userResponse struct {
	Username          string    `json:"username"`
	Fullname          string    `json:"fullname"`
	Email             string    `json:"email"`
	PasswordChangedAt time.Time `json:"password_changed_at"`
	CreatedAt         time.Time `json:"created_at"`
}

func newUserResponse(user db.User) userResponse {
	return userResponse{
		Username:          user.Username,
		Fullname:          user.Fullname,
		Email:             user.Email,
		PasswordChangedAt: user.PasswordChangedAt.Time,
		CreatedAt:         user.CreatedAt.Time,
	}
}

func (server *Server) createUser(ctx *gin.Context) {
	var req createUserRequest

	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	arg := db.CreateUserParams{
		Username:       req.Username,
		HashedPassword: hashedPassword,
		Fullname:       req.Fullname,
		Email:          req.Email,
	}

	user, err := server.store.CreateUser(ctx, arg)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			switch pgErr.Code {
			case "23505":
				ctx.JSON(http.StatusForbidden, errResponse(err))
				return
			}
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	resp := newUserResponse(user)

	ctx.JSON(http.StatusOK, resp)
}

type loginUserRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=8"`
}

type loginUserResponse struct {
	SessionID             uuid.UUID    `json:"session_id"`
	AccessToken           string       `json:"access_token"`
	AccessTokenExpiredAt  time.Time    `json:"access_token_expired_at"`
	RefreshToken          string       `json:"refresh_token"`
	RefreshTokenExpiredAt time.Time    `json:"refresh_token_expired_at"`
	User                  userResponse `json:"user"`
}

func (server *Server) loginUser(ctx *gin.Context) {
	var req loginUserRequest

	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	user, err := server.store.GetUser(ctx, req.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Username atau password salah")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	err = util.CheckHashedPassword(req.Password, user.HashedPassword)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errResponse(errors.New("Username atau password salah")))
		return
	}

	accessToken, accessPayload, err := server.tokenMaker.CreateToken(user.Username, server.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	refreshToken, refreshPayload, err := server.tokenMaker.CreateToken(user.Username, server.config.RefreshTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	session, err := server.store.CreateSession(ctx, db.CreateSessionParams{
		ID:           pgtype.UUID{Bytes: refreshPayload.ID, Valid: true},
		Username:     user.Username,
		RefreshToken: refreshToken,
		UserAgent:    ctx.Request.UserAgent(),
		ClientIp:     ctx.ClientIP(),
		IsBlocked:    false,
		ExpiredAt:    pgtype.Timestamptz{Time: refreshPayload.ExpiredAt, Valid: true},
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	resp := &loginUserResponse{
		SessionID:             session.ID.Bytes,
		AccessToken:           accessToken,
		AccessTokenExpiredAt:  accessPayload.ExpiredAt,
		RefreshToken:          session.RefreshToken,
		RefreshTokenExpiredAt: session.ExpiredAt.Time,
		User:                  newUserResponse(user),
	}

	ctx.JSON(http.StatusOK, resp)
}

type requestToken struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type renewSessionResponse struct {
	AccessToken string    `json:"access_token"`
	ExpiredAt   time.Time `json:"expired_at"`
}

func (server *Server) renewSession(ctx *gin.Context) {
	var req requestToken
	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	refreshPayload, err := server.tokenMaker.VerifyToken(req.RefreshToken)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	session, err := server.store.GetSession(ctx, pgtype.UUID{Bytes: refreshPayload.ID, Valid: true})
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	if session.IsBlocked {
		err := errors.New("Session is blocked")
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	if session.Username != refreshPayload.Username {
		err := errors.New("Incorrect session user")
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	if session.RefreshToken != req.RefreshToken {
		err := errors.New("Invalid refresh token")
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	if time.Now().After(session.ExpiredAt.Time) {
		err := errors.New("Session has expired")
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	accessToken, accessPayload, err := server.tokenMaker.CreateToken(refreshPayload.Username, server.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &renewSessionResponse{
		AccessToken: accessToken,
		ExpiredAt:   accessPayload.ExpiredAt,
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) logoutUser(ctx *gin.Context) {
	var req requestToken
	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	refreshPayload, err := server.tokenMaker.VerifyToken(req.RefreshToken)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	session, err := server.store.GetSession(ctx, pgtype.UUID{Bytes: refreshPayload.ID, Valid: true})
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	if session.Username != refreshPayload.Username {
		err := errors.New("Incorrect session user")
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	if session.RefreshToken != req.RefreshToken {
		err := errors.New("Invalid refresh token")
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	if time.Now().After(session.ExpiredAt.Time) {
		err := errors.New("Session is expired")
		ctx.JSON(http.StatusUnauthorized, errResponse(err))
		return
	}

	err = server.store.BlockSession(ctx, pgtype.UUID{Bytes: refreshPayload.ID, Valid: true})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

func (server *Server) getMe(ctx *gin.Context) {
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

	ctx.JSON(http.StatusOK, newUserResponse(user))
}
