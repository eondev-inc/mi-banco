# Mi-Banco
## Un desarrollo para test técnico

Mi Banco es una aplicacion Cliente/Servidor realizada en el stack MEAN (Mongo, Express, Angular y Nodejs) desarrollado completamente en Typescript, además se utiliza Docker para levantar la Aplicación en el host

- Angular 18.2.14
- MongoDB latest (8.x compatible)
- Node.js 20 LTS (Alpine)
- TypeScript 5.4.5 (client) / 5.7.3 (server)
- Express 4.21.2
- Mongoose 8.10.0

## Cambios Recientes (2026)

### Migración de Dependencias
El proyecto ha sido actualizado desde Node.js 12 y Angular 11/14 a versiones modernas LTS:

**Backend:**
- Migración a Node.js 20 LTS
- Actualización de Express 4.17 → 4.21
- Actualización de Mongoose 6.x → 8.x
- Migración de Moment.js a API nativa Intl.DateTimeFormat
- Fix crítico en cluster API: `cluster.isMaster` → `cluster.isPrimary`
- Eliminación de body-parser (ahora integrado en Express)
- Migración de TSLint a ESLint
- Conversión de CommonJS require() a ES imports

**Frontend:**
- Migración incremental Angular 14 → 15 → 16 → 17 → 18
- Actualización de Angular Material a componentes MDC
- Migración RxJS: `.toPromise()` → `firstValueFrom()`
- Actualización de sintaxis subscribe a pattern `{ next, error }`
- Migración de TSLint a ESLint
- Eliminación de anti-pattern `window.location.reload()`

**Docker:**
- Actualización de imágenes base a Node 20-alpine
- Optimización de builds multi-stage

## Features

- Login y Registro Básico 
- Ver historial de transferencias
- Incribir nuevos destinatarios
- Realizar transferencias a destinatarios 


## Instalacion

Mi-banco necesita [Node.js](https://nodejs.org/) v20 LTS y Docker Compose 3.7+

```bash
docker-compose build
docker-compose up -d
```

El servidor se ejecutará en modo cluster con workers equivalentes al número de CPUs disponibles.

## TODO

- Mejorar el Login y registro básico
- Se puede refactorizar el código 


## Site:
:construction: El sitio pronto estará en netlify