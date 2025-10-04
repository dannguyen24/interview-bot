.PHONY: dev-up dev-down prod-up prod-down clean

dev-up:
	docker-compose up --build

dev-down:
	docker-compose down

clean:
	docker-compose down -v
	docker system prune -f
