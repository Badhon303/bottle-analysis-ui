# Stage 1: Build the Vue app
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS production-stage

RUN echo 'server { \
    listen 8065; \
    location /api { \
        proxy_pass https://analysis-api.codemonks.dev; \
        proxy_set_header Host analysis-api.codemonks.dev; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_ssl_server_name on; \
    } \
    location /uploads { \
        proxy_pass https://analysis-api.codemonks.dev; \
        proxy_set_header Host analysis-api.codemonks.dev; \
        proxy_ssl_server_name on; \
    } \
    location /outputs { \
        proxy_pass https://analysis-api.codemonks.dev; \
        proxy_set_header Host analysis-api.codemonks.dev; \
        proxy_ssl_server_name on; \
    } \
    location /crops { \
        proxy_pass https://analysis-api.codemonks.dev; \
        proxy_set_header Host analysis-api.codemonks.dev; \
        proxy_ssl_server_name on; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 8065

CMD ["nginx", "-g", "daemon off;"]