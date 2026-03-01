# Stage 1: Build
FROM node:20-alpine AS build-stage
WORKDIR /app

# Add the Build Argument
ARG VITE_API_BASE_URL
# Set it as an Env variable for the build process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS production-stage

# Configure Nginx for Port 8065, SPA routing, and API Proxying
RUN echo 'server { \
    listen 8065; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    # This replaces your Vite Proxy config for Production \
    location /api { \
        proxy_pass https://analysis-api.codemonks.dev; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 8065
CMD ["nginx", "-g", "daemon off;"]