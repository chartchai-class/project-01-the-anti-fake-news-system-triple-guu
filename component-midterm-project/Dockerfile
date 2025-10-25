# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Accept backend base as a build argument (used by Vite)
ARG VITE_BACKEND_BASE
ENV VITE_BACKEND_BASE=$VITE_BACKEND_BASE
COPY . .
RUN npm run build

# ---- Serve ----
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# (Optional SPA fallback)
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx-vue-app.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]


# # build stage
# FROM node:20-alpine AS build-stage
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
# # production stage
# FROM nginx:stable-alpine AS production-stage
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# COPY ./nginx-vue-app.conf /etc/nginx/conf.d/default.conf