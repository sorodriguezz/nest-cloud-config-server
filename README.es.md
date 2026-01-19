# Nest Cloud Config Server

[English](./README.md) | **Español**

Servidor de configuración centralizada para aplicaciones NestJS, inspirado en Spring Cloud Config Server. Administra configuraciones de múltiples aplicaciones desde repositorios Git (GitHub, GitLab, Azure DevOps).

## 🚀 Características

- ✅ Soporte para múltiples repositorios Git
- ✅ Compatible con GitHub, GitLab y Azure DevOps
- ✅ Múltiples formatos de archivo: JSON, YAML, XML, Properties
- ✅ Sincronización automática de repositorios
- ✅ Formato plano con dot notation para todas las configuraciones
- ✅ Gestión de perfiles (dev, prod, test, etc.)
- ✅ API REST simple y clara
- ✅ Módulo global de NestJS

## 📦 Instalación

```bash
npm install @sorodriguez/nest-cloud-config-server
```

## 🔧 Configuración Básica

### 1. Importar el módulo en tu aplicación

```typescript
import { Module } from "@nestjs/common";
import {
  ConfigServerModule,
  RepositoryType,
} from "@sorodriguez/nest-cloud-config-server";

@Module({
  imports: [
    ConfigServerModule.forRoot({
      baseRepoPath: "../repos", // Directorio donde se clonarán los repositorios
      repositories: [
        {
          name: RepositoryType.GITHUB,
          host: "github.com",
          protocol: "https",
          organization: "tu-organizacion",
          repository: "config-repo",
          branch: "main",
          auth: {
            username: "tu-usuario",
            token: "tu-token", // Personal Access Token
          },
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### 2. Configuración con múltiples repositorios

```typescript
ConfigServerModule.forRoot({
  baseRepoPath: "../repos",
  repositories: [
    {
      name: RepositoryType.GITHUB,
      host: "github.com",
      protocol: "https",
      organization: "mi-org",
      repository: "config-prod",
      branch: "main",
      auth: {
        username: "usuario",
        token: "ghp_xxxxx",
      },
    },
    {
      name: RepositoryType.GITLAB,
      host: "gitlab.com",
      protocol: "https",
      organization: "mi-grupo",
      repository: "config-dev",
      branch: "develop",
      auth: {
        username: "usuario",
        token: "glpat-xxxxx",
      },
    },
    {
      name: RepositoryType.AZURE,
      host: "dev.azure.com",
      protocol: "https",
      organization: "mi-empresa",
      repository: "config-test",
      branch: "test",
      auth: {
        username: "usuario",
        token: "xxxxx",
      },
    },
  ],
});
```

## ⚙️ Opciones de Configuración (Opcional)

```typescript
ConfigServerModule.forRoot({
  // Requerido
  baseRepoPath: "../repos",
  repositories: [],

  // Opcional
  configSources: [], // Implementaciones adicionales de ConfigSource
  enableLogging: true, // Desactiva logs de la libreria si es false
  sourceStrategy: "first", // "first" | "merge"
  sourceOrder: "filesystem-first", // "filesystem-first" | "filesystem-last"
  mergeStrategy: "deep", // "deep" | "shallow"
  filePatterns: [
    "application.*",
    "application-{profile}.*",
    "{application}.*",
    "{application}-{profile}.*",
  ],
  cacheTtlMs: 30000, // 0 desactiva cache
  syncIntervalMs: 300000, // 0 desactiva auto-sync
});
```

Valores por defecto si no se configuran:

- `configSources`: `[]` (solo se usa la fuente de filesystem)
- `enableLogging`: `true` (logs de la libreria habilitados)
- `sourceStrategy`: `"first"` (gana la primera fuente que responde)
- `sourceOrder`: `"filesystem-first"` (filesystem se evalua primero)
- `mergeStrategy`: `"deep"` (merge recursivo de objetos)
- `filePatterns`: `["application.*", "application-{profile}.*", "{application}.*", "{application}-{profile}.*"]`
- `cacheTtlMs`: desactivado (no hay cache)
- `syncIntervalMs`: desactivado (no hay auto-sync)

Notas:

- `sourceStrategy: "merge"` combina todas las fuentes en orden; valores posteriores sobrescriben con `mergeStrategy`.
- `cacheTtlMs` cachea la respuesta aplanada y usa ETag + `If-None-Match` para responder 304.
- `syncIntervalMs` ejecuta sync periodico y limpia cache despues de cada sync.

## 📂 Estructura de Archivos en el Repositorio

Organiza tus archivos de configuración usando patrones. Patrones y precedencia por defecto:

```
config-repo/
├── application.yml
├── application-prod.yml
├── mi-app-dev.json
├── mi-app-prod.yaml
├── mi-app-test.properties
├── otra-app-dev.xml
└── otra-app-prod.json
```

**Patrones por defecto (el último gana):**

- `application.*`
- `application-{profile}.*`
- `{application}.*`
- `{application}-{profile}.*`

## 🌐 API Endpoints

### 1. Obtener Configuración

**GET** `/config-file?repo={repo}&application={app}&profile={profile}`

Obtiene la configuración de una aplicación específica en formato plano.

**Parámetros:**

- `repo`: Nombre del repositorio
- `application`: Nombre de la aplicación
- `profile`: Perfil de configuración (dev, prod, test, etc.)

**Ejemplo:**

```bash
curl "http://localhost:3000/config-file?repo=config-repo&application=mi-app&profile=dev"
```

**Cache con ETag (opcional):**

```bash
curl -H 'If-None-Match: "etag-value"' "http://localhost:3000/config-file?repo=config-repo&application=mi-app&profile=dev"
```

**Respuesta (formato plano):**

```json
{
  "server.port": 8080,
  "server.host": "localhost",
  "database.url": "jdbc:mysql://localhost:3306/db",
  "database.username": "root",
  "database.pool.max": 10,
  "feature.flags.enabled": true
}
```

### 2. Sincronizar Repositorios

**POST** `/sync`

Sincroniza todos los repositorios de forma forzada (hard reset + pull).

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/sync
```

**Respuesta:**

```json
{
  "message": "Repositories synchronized successfully"
}
```

### 3. Sincronizar un Repositorio

**POST** `/sync/{repo}?force=true`

Sincroniza un repositorio. Usa `force=true` para hard reset + pull.

**Ejemplo:**

```bash
curl -X POST "http://localhost:3000/sync/config-repo?force=true"
```

### 4. Estado de Salud

**GET** `/health`

Retorna estado de sync, errores y locks.

### 5. Listar Directorios y Archivos

**GET** `/directories`

Lista todos los repositorios clonados y sus archivos de configuración.

**Ejemplo:**

```bash
curl http://localhost:3000/directories
```

**Respuesta:**

```json
[
  {
    "name": "config-repo",
    "files": ["mi-app-dev.json", "mi-app-prod.yaml", "otra-app-dev.properties"]
  }
]
```

## 📝 Formatos Soportados

### JSON

```json
{
  "server": {
    "port": 8080,
    "host": "localhost"
  }
}
```

### YAML

```yaml
server:
  port: 8080
  host: localhost
```

### Properties

```properties
server.port=8080
server.host=localhost
```

### XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <server>
    <port>8080</port>
    <host>localhost</host>
  </server>
</config>
```

**Todas las configuraciones se retornan en formato plano:**

```json
{
  "server.port": 8080,
  "server.host": "localhost"
}
```

## 🔐 Autenticación con Git

### GitHub

Genera un Personal Access Token (PAT):

1. Ir a Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generar nuevo token con permiso `repo`
3. Usar el token en la configuración

```typescript
auth: {
  username: 'tu-usuario',
  token: 'ghp_xxxxxxxxxxxxx',
}
```

### GitLab

Genera un Personal Access Token:

1. Ir a Preferences → Access Tokens
2. Crear token con scope `read_repository`
3. Usar el token en la configuración

```typescript
auth: {
  username: 'tu-usuario',
  token: 'glpat-xxxxxxxxxxxxx',
}
```

### Azure DevOps

Genera un Personal Access Token (PAT):

1. Ir a User Settings → Personal Access Tokens
2. Crear token con permiso `Code (Read)`
3. Usar el token en la configuración

```typescript
auth: {
  username: 'tu-usuario',
  token: 'xxxxxxxxxxxxx',
}
```

## 🔄 Sincronización Automática

El módulo sincroniza automáticamente los repositorios al iniciar la aplicación. Para sincronizar manualmente:

```bash
curl -X POST http://localhost:3000/sync
```

## 💡 Uso con ConfigService

Puedes inyectar `ConfigServerService` en cualquier servicio:

```typescript
import { Injectable } from "@nestjs/common";
import { ConfigServerService } from "@sorodriguez/nest-cloud-config-server";

@Injectable()
export class MyService {
  constructor(private readonly configServerService: ConfigServerService) {}

  async getRepositories() {
    return this.configServerService.getRepositories();
  }

  async syncRepositories() {
    await this.configServerService.forceSyncRepositories();
  }
}
```

## 📋 Tipos TypeScript

```typescript
import {
  ConfigServerModuleOptions,
  RepositoryManager,
  RepositoryType,
  ConfigSource,
} from "@sorodriguez/nest-cloud-config-server";
```

## 📄 Licencia

ISC
