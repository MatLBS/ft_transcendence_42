PORT = 3000
IMAGE_NAME = ft_transcendence_42
CONTAINER_NAME = ft_transcendence_42_container

include .env
export $(shell sed 's/=.*//' .env)

all: build up

build:
	@docker-compose build

up:
	@docker-compose up -d

down:
	@docker-compose down

fclean: down
	@docker system prune -af
	@docker volume prune -f
	@rm -rf prometheus/data grafana/data


re: fclean all

.PHONY: all build run fclean re
