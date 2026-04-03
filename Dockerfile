# Build statique Vite
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Optionnel : clé Gemini au build (sinon saisie dans l’app / localStorage)
ARG VITE_GOOGLE_AI_API_KEY
ENV VITE_GOOGLE_AI_API_KEY=$VITE_GOOGLE_AI_API_KEY

RUN npm run build

# Fichiers servis par nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
