package db

import (
	"context"
	"log"
	"os"
	"testing"

	"github.com/bergamo17/aila/internal/util"
	"github.com/jackc/pgx/v5/pgxpool"
)

var testQueries *Queries
var testDB *pgxpool.Pool

func TestMain(m *testing.M) {
	config, err := util.LoadConfigPath("../..")
	if err != nil {
		log.Fatal("Cannot load the config:", err)
	}

	testDB, err := pgxpool.New(context.Background(), config.DBSource)
	if err != nil {
		log.Fatal("Cannot connect to db:", err)
	}

	testQueries = New(testDB)

	code := m.Run()
	testDB.Close()
	os.Exit(code)
}
