# Build stage
FROM node:20-bullseye AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.25-alpine
COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.env.template /env.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
