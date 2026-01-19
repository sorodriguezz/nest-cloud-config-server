# Nest Cloud Config Server

**English** | [Español](./README.es.md)

Centralized configuration server for NestJS applications, inspired by Spring Cloud Config Server. Manage configurations for multiple applications from Git repositories (GitHub, GitLab, Azure DevOps).

## 🚀 Features

- ✅ Multiple Git repository support
- ✅ Compatible with GitHub, GitLab, and Azure DevOps
- ✅ Multiple file formats: JSON, YAML, XML, Properties
- ✅ Automatic repository synchronization
- ✅ Flat format with dot notation for all configurations
- ✅ Profile management (dev, prod, test, etc.)
- ✅ Simple and clear REST API
- ✅ NestJS global module

## 📦 Installation

```bash
npm install @sorodriguez/nest-cloud-config-server
```

## 🔧 Basic Setup

### 1. Import the module in your application

```typescript
import { Module } from "@nestjs/common";
import {
  ConfigServerModule,
  RepositoryType,
} from "@sorodriguez/nest-cloud-config-server";

@Module({
  imports: [
    ConfigServerModule.forRoot({
      baseRepoPath: "../repos", // Directory where repositories will be cloned
      repositories: [
        {
          name: RepositoryType.GITHUB,
          host: "github.com",
          protocol: "https",
          organization: "your-organization",
          repository: "config-repo",
          branch: "main",
          auth: {
            username: "your-username",
            token: "your-token", // Personal Access Token
          },
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### 2. Configuration with multiple repositories

```typescript
ConfigServerModule.forRoot({
  baseRepoPath: "../repos",
  repositories: [
    {
      name: RepositoryType.GITHUB,
      host: "github.com",
      protocol: "https",
      organization: "my-org",
      repository: "config-prod",
      branch: "main",
      auth: {
        username: "username",
        token: "ghp_xxxxx",
      },
    },
    {
      name: RepositoryType.GITLAB,
      host: "gitlab.com",
      protocol: "https",
      organization: "my-group",
      repository: "config-dev",
      branch: "develop",
      auth: {
        username: "username",
        token: "glpat-xxxxx",
      },
    },
    {
      name: RepositoryType.AZURE,
      host: "dev.azure.com",
      protocol: "https",
      organization: "my-company",
      repository: "config-test",
      branch: "test",
      auth: {
        username: "username",
        token: "xxxxx",
      },
    },
  ],
});
```

## ⚙️ Configuration Options (Optional)

```typescript
ConfigServerModule.forRoot({
  // Required
  baseRepoPath: "../repos",
  repositories: [],

  // Optional
  configSources: [], // Additional ConfigSource implementations
  enableLogging: true, // Disable library logs if false
  sourceStrategy: "first", // "first" | "merge"
  sourceOrder: "filesystem-first", // "filesystem-first" | "filesystem-last"
  mergeStrategy: "deep", // "deep" | "shallow"
  filePatterns: [
    "application.*",
    "application-{profile}.*",
    "{application}.*",
    "{application}-{profile}.*",
  ],
  cacheTtlMs: 30000, // 0 disables cache
  syncIntervalMs: 300000, // 0 disables auto-sync
});
```

Defaults when omitted:

- `configSources`: `[]` (only filesystem source is used)
- `enableLogging`: `true` (library logs are enabled)
- `sourceStrategy`: `"first"` (first source that returns config wins)
- `sourceOrder`: `"filesystem-first"` (filesystem source is evaluated first)
- `mergeStrategy`: `"deep"` (nested objects merge recursively)
- `filePatterns`: `["application.*", "application-{profile}.*", "{application}.*", "{application}-{profile}.*"]`
- `cacheTtlMs`: disabled (no cache)
- `syncIntervalMs`: disabled (no auto-sync)

Notes:

- `sourceStrategy: "merge"` combines all sources in order; later values override earlier ones using `mergeStrategy`.
- `cacheTtlMs` caches the flattened response and uses ETag + `If-None-Match` to return 304.
- `syncIntervalMs` triggers periodic sync and clears cache after each sync.

## 📂 File Structure in Repository

Organize your configuration files using patterns. Default patterns and precedence:

```
config-repo/
├── application.yml
├── application-prod.yml
├── my-app-dev.json
├── my-app-prod.yaml
├── my-app-test.properties
├── another-app-dev.xml
└── another-app-prod.json
```

**Default patterns (last wins):**

- `application.*`
- `application-{profile}.*`
- `{application}.*`
- `{application}-{profile}.*`

## 🌐 API Endpoints

### 1. Get Configuration

**GET** `/config-file?repo={repo}&application={app}&profile={profile}`

Get the configuration for a specific application in flat format.

**Parameters:**

- `repo`: Repository name
- `application`: Application name
- `profile`: Configuration profile (dev, prod, test, etc.)

**Example:**

```bash
curl "http://localhost:3000/config-file?repo=config-repo&application=my-app&profile=dev"
```

**ETag cache (optional):**

```bash
curl -H 'If-None-Match: "etag-value"' "http://localhost:3000/config-file?repo=config-repo&application=my-app&profile=dev"
```

**Response (flat format):**

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

### 2. Synchronize Repositories

**POST** `/sync`

Synchronize all repositories forcefully (hard reset + pull).

**Example:**

```bash
curl -X POST http://localhost:3000/sync
```

**Response:**

```json
{
  "message": "Repositories synchronized successfully"
}
```

### 3. Synchronize a Single Repository

**POST** `/sync/{repo}?force=true`

Synchronize one repository. Use `force=true` for hard reset + pull.

**Example:**

```bash
curl -X POST "http://localhost:3000/sync/config-repo?force=true"
```

### 4. Health Status

**GET** `/health`

Returns sync status, errors, and locks.

### 5. List Directories and Files

**GET** `/directories`

List all cloned repositories and their configuration files.

**Example:**

```bash
curl http://localhost:3000/directories
```

**Response:**

```json
[
  {
    "name": "config-repo",
    "files": [
      "my-app-dev.json",
      "my-app-prod.yaml",
      "another-app-dev.properties"
    ]
  }
]
```

## 📝 Supported Formats

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

**All configurations are returned in flat format:**

```json
{
  "server.port": 8080,
  "server.host": "localhost"
}
```

## 🔐 Git Authentication

### GitHub

Generate a Personal Access Token (PAT):

1. Go to Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permission
3. Use the token in configuration

```typescript
auth: {
  username: 'your-username',
  token: 'ghp_xxxxxxxxxxxxx',
}
```

### GitLab

Generate a Personal Access Token:

1. Go to Preferences → Access Tokens
2. Create token with `read_repository` scope
3. Use the token in configuration

```typescript
auth: {
  username: 'your-username',
  token: 'glpat-xxxxxxxxxxxxx',
}
```

### Azure DevOps

Generate a Personal Access Token (PAT):

1. Go to User Settings → Personal Access Tokens
2. Create token with `Code (Read)` permission
3. Use the token in configuration

```typescript
auth: {
  username: 'your-username',
  token: 'xxxxxxxxxxxxx',
}
```

## 🔄 Automatic Synchronization

The module automatically synchronizes repositories when starting the application. To manually synchronize:

```bash
curl -X POST http://localhost:3000/sync
```

## 💡 Usage with ConfigService

You can inject `ConfigServerService` into any service:

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

## 📋 TypeScript Types

```typescript
import {
  ConfigServerModuleOptions,
  RepositoryManager,
  RepositoryType,
  ConfigSource,
} from "@sorodriguez/nest-cloud-config-server";
```

## 📄 License

ISC
