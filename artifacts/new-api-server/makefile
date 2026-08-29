include app.env
export

postgress:
	docker run --name postgres16 -p $(DB_PORT):5432 -e POSTGRES_USER=$(DB_USER) -e POSTGRES_PASSWORD=$(DB_PASSWORD) -e POSTGRES_DB=postgres -d postgres:16-alpine

createdb:
	docker exec -it postgres16 createdb --username=$(DB_USER) --owner=root $(DB_DATABASE)

dropdb:
	docker exec -it postgres16 dropdb $(DB_DATABASE)

migrateup:
	migrate -path db/migrations -database "$(DB_URL)" -verbose up

migratedown:
	migrate -path db/migrations -database "$(DB_URL)" -verbose down

sqlc:
	sqlc generate

test: 
	go test -v -cover ./...

psql:
	docker exec -it aila-db psql -U aila -d aila_db

server: 
	go run main.go

.PHONY: postgress createdb dropdb migrateup migratedown sqlc test psql server