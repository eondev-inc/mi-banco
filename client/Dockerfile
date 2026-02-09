# ============================================================================
# Multi-stage Dockerfile - Producción con Nginx
# ============================================================================
# Stage 1: Build de Angular
# ============================================================================
FROM node:20-alpine AS build-step

LABEL maintainer="Mi-Banco Development Team"
LABEL description="Angular production build with nginx"
LABEL version="1.0"

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluye devDependencies necesarias para build)
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build de producción
# Genera archivos optimizados en /app/dist/mi-banco/browser (Angular 21+)
RUN npm run build -- --configuration production

# ============================================================================
# Stage 2: Servidor Nginx
# ============================================================================
FROM nginx:1.25-alpine

# Limpiar archivos default de nginx
RUN rm -rf /usr/share/nginx/html/* && \
    rm -rf /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada de nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados desde el stage anterior
# La configuración actual genera output en dist/mi-banco
COPY --from=build-step /app/dist/mi-banco /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Nginx se ejecuta en foreground
CMD ["nginx", "-g", "daemon off;"]
