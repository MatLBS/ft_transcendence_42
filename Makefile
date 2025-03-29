PORT = 3000
IMAGE_NAME = ft_transcendence_42
CONTAINER_NAME = ft_transcendence_42_container


all: build run

build:
	@docker build --no-cache -t $(IMAGE_NAME) .

run:
	@docker run -p ${PORT}:${PORT} --name $(CONTAINER_NAME) -v "$(PWD)":/usr/src/app -v /usr/src/app/node_modules $(IMAGE_NAME)

it:
	@docker build -t $(IMAGE_NAME) .
	@docker run --rm -it -p ${PORT}:${PORT} --name $(CONTAINER_NAME) -v "$(PWD)":/usr/src/app -v /usr/src/app/node_modules $(IMAGE_NAME) sh

fclean:
	@docker stop $(CONTAINER_NAME)
	@docker rm $(CONTAINER_NAME)
	@docker rmi $(IMAGE_NAME)
	@docker system prune -f

re: fclean all

.PHONY: all build run fclean re
