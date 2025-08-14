.PHONY: install dev build start test docker-build docker-run compose-up compose-dev

install:
	npm install

# Run the Next.js development server
dev:
	npm run dev

# Build the application for production
build:
	npm run build

# Start the built application
start:
	npm start

# Execute the Jest test suite
test:
	npm test

# Docker image build
docker-build:
	docker build -t mondash-frontend .

# Run the image in a container
docker-run:
	docker run -p 3000:80 mondash-frontend

# Run with docker compose
compose-up:
	docker compose up --build

# Development mode with docker compose
compose-up-dev:
	docker compose -f docker-compose.dev.yml up
