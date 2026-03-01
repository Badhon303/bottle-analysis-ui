# Stage 1: Build the Vue app
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS production-stage

# Create a custom Nginx config for port 8065 and Vue Router support
RUN echo 'server { \
    listen 8065; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Inform Docker we are using 8065
EXPOSE 8065

CMD ["nginx", "-g", "daemon off;"]