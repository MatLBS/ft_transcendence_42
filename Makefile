PORT = 3000
IMAGE_NAME = ft_transcendence_42
CONTAINER_NAME = ft_transcendence_42_container


all: build run

build:
	@docker build -t $(IMAGE_NAME) .

run:
	@docker run -p 3000:3000 --name $(CONTAINER_NAME) $(IMAGE_NAME)

fclean:
	@docker stop $(CONTAINER_NAME)
	@docker rm $(CONTAINER_NAME)
	@docker rmi $(IMAGE_NAME)
	@docker system prune -f

re: fclean all

.PHONY: all build run fclean re