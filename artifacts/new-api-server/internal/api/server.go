package api

import (
	"fmt"

	db "github.com/bergamo17/aila/db/sqlc"
	"github.com/bergamo17/aila/internal/token"
	"github.com/bergamo17/aila/internal/util"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config     util.Config
	store      db.Store
	tokenMaker token.Maker
	router     *gin.Engine
}

func NewServer(config util.Config, store db.Store) (*Server, error) {
	tokenMaker, err := token.NewPasetoMaker(config.TokenSymetricKey)
	if err != nil {
		return nil, fmt.Errorf("Cannot create token maker: %w", err)
	}

	server := &Server{
		config:     config,
		store:      store,
		tokenMaker: tokenMaker,
	}

	server.setupRouter()
	return server, nil
}

func (server *Server) setupRouter() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"POST", "GET", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	authRoutes := router.Group("/").Use(authMiddleware(server.tokenMaker))

	authRoutes.POST("/subject/create", server.createSubject)
	authRoutes.POST("/task/create", server.createTask)
	authRoutes.PUT("/task/:id", server.updateTask)
	authRoutes.PUT("/task/status/:id", server.updateTaskStatus)
	authRoutes.DELETE("/task/delete", server.deleteTask)
	authRoutes.POST("/user/logout", server.logoutUser)
	authRoutes.GET("/user/me", server.getMe)

	router.POST("/user/create", server.createUser)
	router.POST("/user/login", server.loginUser)
	router.POST("/token/renew", server.renewSession)

	server.router = router
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
