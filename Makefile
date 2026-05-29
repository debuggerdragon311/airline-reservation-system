# AeroBook — developer shortcuts
# Usage: make <target>
# Requires: docker, java 25, make

.PHONY: db db-down db-reset run dev help

## Start Postgres in the background
db:
	docker compose up -d

## Stop Postgres
db-down:
	docker compose down

## Wipe the database volume and restart fresh (picks up seed data changes)
db-reset:
	docker compose down -v
	docker compose up -d

## Run the Spring Boot app with env variables loaded from .env
run:
	cd backend && export $$(grep -v '^#' ../.env | xargs) && ./mvnw spring-boot:run

## Start database then run app (most common command)
dev: db
	cd backend && export $$(grep -v '^#' ../.env | xargs) && ./mvnw spring-boot:run

## Show available commands
help:
	@echo ""
	@echo "  make db        — start Postgres"
	@echo "  make db-down   — stop Postgres"
	@echo "  make db-reset  — wipe DB volume and restart (re-runs seed)"
	@echo "  make run       — run Spring Boot app (DB must already be up)"
	@echo "  make dev       — start DB + app together"
	@echo ""