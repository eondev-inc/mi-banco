# ============================================================================
# Dockerfile - Producción NestJS Backend
# ============================================================================
# Multi-stage build optimizado para producción con imágenes pequeñas
# ============================================================================

# =============================================================================
# STAGE 1: Dependencies (Builder)
# =============================================================================
FROM node:20-alpine AS dependencies

# Metadatos
LABEL maintainer="Mi-Banco Development Team"
LABEL description="NestJS backend - Production build stage"

# Instalar dependencias necesarias para compilación
# python3, make, g++ son necesarios para bcrypt y otras dependencias nativas
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias (incluye devDependencies para build)
RUN npm install --legacy-peer-deps

# =============================================================================
# STAGE 2: Build
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar node_modules del stage anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Compilar aplicación NestJS a JavaScript
RUN npm run build

# Eliminar devDependencies después del build
RUN npm prune --production --legacy-peer-deps

# =============================================================================
# STAGE 3: Production
# =============================================================================
FROM node:20-alpine AS production

# Metadatos finales
LABEL maintainer="Mi-Banco Development Team"
LABEL description="NestJS backend - Production runtime"
LABEL version="1.0.0"

# Variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=8001

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar solo archivos necesarios desde builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar aplicación
# Nota: No usamos cluster mode en Docker porque ya se escala con múltiples contenedores
CMD ["node", "dist/main.js"]
