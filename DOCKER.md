# Docker Setup Guide

This project includes Docker configuration for containerized deployment.

## Files Created

- **Dockerfile**: Multi-stage build using Node.js for building and nginx for serving
- **nginx.conf**: Nginx configuration with SPA routing and static asset caching
- **.dockerignore**: Excludes unnecessary files from Docker build
- **docker-compose.yml** (optional): Can be deleted if you prefer using Docker CLI directly

## Building and Running

### Quick Start (Using Docker CLI)

**Build the image:**

```bash
docker build -t analysis-tool-frontend:latest .
```

**Run the container on port 8065:**

```bash
docker run -d -p 8065:8065 --name analysis-tool-frontend analysis-tool-frontend:latest
```

### Alternative: Using Docker Compose

If you prefer using docker-compose:

**Start the container:**

```bash
docker-compose up -d
```

**View logs:**

```bash
docker-compose logs -f
```

**Stop the container:**

```bash
docker-compose down
```

## Environment Variables

Set the backend API URL using the `BOTTLE_VISION_BASE_URL` environment variable:

```bash
# Using Docker CLI
docker run -d -p 8065:8065 \
  -e BOTTLE_VISION_BASE_URL=https://analysis-api.codemonks.dev \
  analysis-tool-frontend:latest
```

## Access the Application

Once running, access the frontend at:

```
http://localhost:8065
```

## Notes

- The Dockerfile uses Node.js 18 Alpine for a lightweight build stage
- nginx Alpine serves the static files efficiently
- Static assets are cached with 1-year expiration
- SPA routing is properly configured to handle Vue Router navigation
- Gzip compression is enabled for better performance
- Application runs on port 8065 (match your Vite dev server)

## Development

For local development without Docker, use:

```bash
npm install
npm run dev
```

## Removing docker-compose.yml

If you don't need docker-compose, simply delete the `docker-compose.yml` file. You can manage containers entirely with Docker CLI commands above.
