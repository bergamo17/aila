package main

import (
	"context"
	"log"

	db "github.com/bergamo17/aila/db/sqlc"
	"github.com/bergamo17/aila/internal/api"
	"github.com/bergamo17/aila/internal/util"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	config, err := util.LoadConfigPath(".")
	if err != nil {
		log.Fatal("Cannot load the config:", err)
	}

	conn, err := pgxpool.New(context.Background(), config.DBSource)
	if err != nil {
		log.Fatal("Cannot connect to the db:", err)
	}

	store := db.NewStore(conn)
	runGinServer(config, store)

}

func runGinServer(config util.Config, store db.Store) {
	server, err := api.NewServer(config, store)
	if err != nil {
		log.Fatal("Cannot create a server:", err)
	}

	err = server.Start(config.HttpServerAddress)
	if err != nil {
		log.Fatal("Cannot connect to the server", err)
	}
}
