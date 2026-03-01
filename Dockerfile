# Stage 1: Build the Vue app
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS production-stage

# Update Nginx config to listen on 8065 instead of 80
RUN sed -i 's/listen  80;/listen 8065;/g' /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 8065

CMD ["nginx", "-g", "daemon off;"]