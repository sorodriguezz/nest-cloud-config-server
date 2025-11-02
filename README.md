# Nest Config Server

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
npm install @sorodriguez/nest-config-server
```

## 🔧 Basic Setup

### 1. Import the module in your application

```typescript
import { Module } from "@nestjs/common";
import {
  ConfigServerModule,
  RepositoryType,
} from "@sorodriguez/nest-config-server";

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

## 📂 File Structure in Repository

Organize your configuration files with the following pattern:

```
config-repo/
├── my-app-dev.json
├── my-app-prod.yaml
├── my-app-test.properties
├── another-app-dev.xml
└── another-app-prod.json
```

**Pattern:** `{application}-{profile}.{extension}`

## 🌐 API Endpoints

### 1. Get Configuration

**GET** `/?repo={repo}&application={app}&profile={profile}`

Get the configuration for a specific application in flat format.

**Parameters:**

- `repo`: Repository name
- `application`: Application name
- `profile`: Configuration profile (dev, prod, test, etc.)

**Example:**

```bash
curl "http://localhost:3000/?repo=config-repo&application=my-app&profile=dev"
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

### 3. List Directories and Files

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
import { ConfigServerService } from "@sorodriguez/nest-config-server";

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
  ConfigQueryDto,
  IConfigFile,
} from "@sorodriguez/nest-config-server";
```

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 👤 Author

**sorodriguezz**

- GitHub: [@sorodriguezz](https://github.com/sorodriguezz)
- NPM: [@sorodriguez](https://www.npmjs.com/~sorodriguez)

## 🐛 Report Issues

If you find a bug or have a suggestion, please open an issue on [GitHub](https://github.com/sorodriguezz/nest-config-server/issues).

## ⭐ Give a Star

If you found this project useful, consider giving it a star on [GitHub](https://github.com/sorodriguezz/nest-config-server).
