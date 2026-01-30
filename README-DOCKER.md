# 🐳 Docker - Guía de Desarrollo y Producción

Esta guía explica cómo usar Docker para desarrollar y desplegar Mi-Banco.

---

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Entorno de Desarrollo](#entorno-de-desarrollo)
- [Entorno de Producción](#entorno-de-producción)
- [Comandos Útiles](#comandos-útiles)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisitos

- Docker >= 20.10
- Docker Compose >= 1.29

```bash
# Verificar instalación
docker --version
docker-compose --version
```

---

## 💻 Entorno de Desarrollo

El entorno de desarrollo incluye **hot reload** para que los cambios en el código se reflejen automáticamente sin reconstruir el contenedor.

### Iniciar Desarrollo

```bash
# Opción 1: Solo cliente frontend (recomendado para desarrollo frontend)
docker-compose up client-dev

# Opción 2: Todo el stack (MongoDB + Backend + Frontend Dev)
docker-compose up mongo-db server client-dev
```

### Acceso

- **Frontend (Angular)**: http://localhost:4200
- **Backend (Express API)**: http://localhost:8000
- **MongoDB**: localhost:27017

### Hot Reload

Los siguientes archivos/directorios están montados con volúmenes para hot reload:

- `client/src/` - Código fuente Angular
- `client/angular.json` - Configuración Angular
- `client/tsconfig*.json` - Configuración TypeScript

**¡Los cambios se reflejan automáticamente en el navegador!** 🔥

### Detener Desarrollo

```bash
# Detener servicios (mantiene volúmenes)
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

---

## 🚀 Entorno de Producción

El entorno de producción construye la aplicación Angular optimizada y la sirve con Nginx.

### Build y Deploy

```bash
# Construir todas las imágenes
docker-compose build

# Iniciar stack completo de producción
docker-compose up -d mongo-db server client

# Verificar que están corriendo
docker-compose ps
```

### Acceso

- **Frontend (Nginx)**: http://localhost:80
- **Backend (Express API)**: http://localhost:8000
- **MongoDB**: localhost:27017

### Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f client
docker-compose logs -f server
docker-compose logs -f mongo-db
```

### Detener Producción

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina datos de MongoDB)
docker-compose down -v
```

---

## 🛠️ Comandos Útiles

### Reconstruir Imágenes

```bash
# Reconstruir cliente de desarrollo
docker-compose build client-dev

# Reconstruir cliente de producción
docker-compose build client

# Reconstruir todo sin cache
docker-compose build --no-cache
```

### Ejecutar Comandos dentro del Contenedor

```bash
# Ejecutar npm install
docker-compose exec client-dev npm install

# Ejecutar tests
docker-compose exec client-dev npm test

# Ejecutar linting
docker-compose exec client-dev npm run lint

# Acceder a shell del contenedor
docker-compose exec client-dev sh
```

### Ver Estado de Contenedores

```bash
# Ver contenedores corriendo
docker-compose ps

# Ver uso de recursos
docker stats

# Ver volúmenes
docker volume ls
```

### Limpiar Todo

```bash
# Detener y eliminar todo (contenedores, redes, volúmenes)
docker-compose down -v

# Eliminar imágenes
docker rmi seventrust/mean_frontend_dev
docker rmi seventrust/mean_frontend
docker rmi seventrust/mean_backend

# Limpiar sistema Docker completo (¡CUIDADO!)
docker system prune -a --volumes
```

---

## 🔍 Troubleshooting

### Hot Reload no Funciona

Si los cambios no se reflejan automáticamente:

1. Verifica que el contenedor está corriendo:
   ```bash
   docker-compose ps client-dev
   ```

2. Revisa los logs:
   ```bash
   docker-compose logs -f client-dev
   ```

3. Reinicia el contenedor:
   ```bash
   docker-compose restart client-dev
   ```

4. Si persiste, reconstruye sin cache:
   ```bash
   docker-compose down
   docker-compose build --no-cache client-dev
   docker-compose up client-dev
   ```

### Error "Port Already in Use"

Si el puerto 4200 está ocupado:

```bash
# Opción 1: Detener proceso local
pkill -f "ng serve"

# Opción 2: Cambiar puerto en docker-compose.yml
# Modificar: "4201:4200" en lugar de "4200:4200"
```

### Contenedor se Detiene Inmediatamente

Verifica los logs:

```bash
docker-compose logs client-dev
```

Causas comunes:
- Error de sintaxis en código TypeScript
- Dependencias faltantes → Ejecuta `docker-compose exec client-dev npm install`
- Permisos de archivos → Revisa que el código esté accesible

### node_modules Desactualizados

Si agregaste nuevas dependencias en `package.json`:

```bash
# Reconstruir imagen para instalar nuevas dependencias
docker-compose down
docker-compose build client-dev
docker-compose up client-dev
```

### MongoDB No se Conecta

1. Verifica que MongoDB está corriendo:
   ```bash
   docker-compose ps mongo-db
   ```

2. Revisa los logs:
   ```bash
   docker-compose logs mongo-db
   ```

3. Reinicia MongoDB:
   ```bash
   docker-compose restart mongo-db
   ```

### Limpiar Volúmenes de node_modules

Si hay conflictos con `node_modules`:

```bash
# Eliminar volumen específico
docker volume rm mi-banco-client-node-modules

# Reconstruir
docker-compose build client-dev
docker-compose up client-dev
```

---

## 📊 Comparación Desarrollo vs Producción

| Aspecto | Desarrollo (`client-dev`) | Producción (`client`) |
|---------|---------------------------|----------------------|
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile` |
| **Puerto** | 4200 | 80 |
| **Comando** | `ng serve` | Nginx estático |
| **Hot Reload** | ✅ Sí | ❌ No |
| **Volúmenes** | ✅ Código montado | ❌ Build copiado |
| **Build Time** | Rápido (~30s) | Lento (~2-3min) |
| **Tamaño Imagen** | ~500 MB | ~50 MB |
| **Uso** | Desarrollo local | Deployment |

---

## 🎯 Workflows Recomendados

### Desarrollo Diario

```bash
# 1. Iniciar servicios de desarrollo
docker-compose up client-dev server mongo-db

# 2. Trabajar en el código (los cambios se reflejan automáticamente)
# Editar archivos en client/src/

# 3. Al finalizar
docker-compose down
```

### Testing de Build de Producción

```bash
# 1. Build de producción
docker-compose build client

# 2. Probar localmente
docker-compose up client server mongo-db

# 3. Verificar en http://localhost:80

# 4. Si todo OK, crear tag y push
docker tag seventrust/mean_frontend seventrust/mean_frontend:v1.0.0
docker push seventrust/mean_frontend:v1.0.0
```

### Deploy a Producción

```bash
# En servidor de producción:
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 📝 Notas Adicionales

- **node_modules**: Se usa un volumen nombrado (`client-node-modules`) para evitar conflictos entre el host y el contenedor.
- **Polling**: El flag `--poll 1000` en `ng serve` detecta cambios cada segundo (necesario en Docker).
- **Redes**: Todos los servicios están en la red `mi-banco-network` para comunicación entre contenedores.
- **Persistencia**: MongoDB usa el volumen `mongo-data` para persistir datos entre reinicios.

---

## 🔗 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Angular CLI Docker Guide](https://angular.dev/tools/cli/deployment#docker)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
