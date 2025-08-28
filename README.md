# Mondash Frontend

<p float="left">
    <img src="upb.png" alt="University Politehnica of Bucharest" width="50"/>
    <img src="Logo.png" alt="Quantum Team @ UPB" width="100"/>
</p>

This project now uses [Next.js](https://nextjs.org/) instead of Create React App.

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs project dependencies. If you encounter peer dependency errors, run `npm install --legacy-peer-deps` instead.

### `npm run dev`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm run build`

Builds the application for production.

### `npm start`

Runs the built application in production mode.

### `npm test`

Runs the Jest test suite. Make sure to install dependencies first with `npm install`. If peer dependency issues occur, you may need to run `npm install --legacy-peer-deps` instead.

## Running with Docker

You can build and run the application inside a Docker container.

### Build the image

```bash
docker build -t mondash-frontend .
```

### Run the container

```bash
docker run -p 3000:80 mondash-frontend
```

Alternatively, start it with docker compose:

```bash
docker-compose up --build
```

### Run the container in development mode

Use the dev compose file to start a container that runs the Next.js dev server:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will install dependencies and run `npm run dev`, enabling hot reloading. The app will be available at [http://localhost:3000](http://localhost:3000).

The frontend expects the backend to be reachable at `http://localhost:8080` by default.
When using Docker Compose this address resolves to your host machine via an `extra_hosts` entry.
You can override the backend URL by setting the `NEXT_PUBLIC_BACKEND_URL` environment variable.

# Copyright and license

This work has been implemented by Bogdan-Calin Ciobanu and Alin-Bogdan Popa under the supervision of prof. Pantelimon George Popescu, within the Quantum Team in the Computer Science and Engineering department,Faculty of Automatic Control and Computers, National University of Science and Technology POLITEHNICA Bucharest (C) 2024. In any type of usage of this code or released software, this notice shall be preserved without any changes.

If you use this software for research purposes, please follow the instructions in the "Cite this repository" option from the side panel.

This work has been partly supported by RoNaQCI, part of EuroQCI, DIGITAL-2021-QCI-01-DEPLOY-NATIONAL, 101091562.

The repository contains a `.env.template` file listing available environment variables. Copy it to `.env` and adjust values as needed. The template is also copied into the Docker image at `/env.template` for reference.

The app will then be available at [http://localhost:3000](http://localhost:3000).
