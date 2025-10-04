.PHONY: dev-up dev-down frontend-up frontend-down clean

dev-up:
	docker-compose up --build

dev-down:
	docker-compose down

frontend-up:
	docker-compose up frontend --build

frontend-down:
	docker-compose down

clean:
	docker-compose down -v
	docker system prune -f
