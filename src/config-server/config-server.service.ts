import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import type { ConfigServerModuleOptions } from "./config-server.options";
import { CONFIG_SERVER_OPTIONS } from "./config-server.tokens";
import { RepositoryRegistry } from "./repository-registry.service";
import { RepositorySyncService } from "./repository-sync.service";
import { ConfigQueryService } from "./config-query.service";
import type { HealthStatus } from "./interfaces/sync-status.interface";
import { createLogger, type LoggerLike } from "../common/logging/config-logger";

@Injectable()
export class ConfigServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: LoggerLike;
  private initialized = false;
  private syncInterval?: NodeJS.Timeout;

  constructor(
    @Inject(CONFIG_SERVER_OPTIONS)
    private readonly options: ConfigServerModuleOptions | undefined,
    private readonly repositoryRegistry: RepositoryRegistry,
    private readonly repositorySyncService: RepositorySyncService,
    private readonly configQueryService: ConfigQueryService
  ) {
    this.logger = createLogger(
      ConfigServerService.name,
      this.options?.enableLogging !== false
    );
  }

  async onModuleInit() {
    if (this.options && !this.initialized) {
      await this.start(this.options);
      this.initialized = true;
    }
  }

  async start(options: ConfigServerModuleOptions) {
    this.repositoryRegistry.initialize(options);
    await this.repositorySyncService.syncAll();
    this.configQueryService.clearCache();
    this.setupAutoSync(options);
  }

  onModuleDestroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Obtiene la lista de repositorios configurados
   */
  public getRepositories() {
    return this.repositoryRegistry.getRepositories();
  }

  /**
   * Sincroniza todos los repositorios de forma forzada
   */
  public async forceSyncRepositories(): Promise<void> {
    await this.repositorySyncService.forceSyncAll();
    this.configQueryService.clearCache();
  }

  /**
   * Sincroniza un repositorio específico
   */
  public async syncRepository(repoName: string, force = false): Promise<void> {
    await this.repositorySyncService.syncRepository(repoName, force);
    this.configQueryService.clearCache();
  }

  /**
   * Expone el estado de salud del servicio
   */
  public getHealthStatus(): HealthStatus {
    const status = this.repositorySyncService.getStatus();
    const repositoryCount = this.repositoryRegistry.getEntries().length;
    const hasErrors =
      status.global.status === "error" ||
      Object.values(status.repositories).some((repo) => repo.status === "error");

    return {
      status: hasErrors ? "degraded" : "ok",
      repositoryCount,
      sync: status,
    };
  }

  /**
   * Expone la ruta base de los repositorios
   */
  public getBaseRepoPath(): string {
    return this.repositoryRegistry.getBaseRepoPath();
  }

  /**
   * Expone los repositorios internos
   */
  public getRepositoriesInternal(): any[] {
    return this.repositoryRegistry.getEntries();
  }

  private setupAutoSync(options: ConfigServerModuleOptions): void {
    const intervalMs = options.syncIntervalMs;

    if (!intervalMs || intervalMs <= 0) {
      return;
    }

    this.logger.log(`Auto-sync scheduled every ${intervalMs}ms`);
    this.syncInterval = setInterval(() => {
      this.repositorySyncService
        .syncAll()
        .then(() => this.configQueryService.clearCache())
        .catch((error: any) =>
          this.logger.error(`Auto-sync failed: ${error.message}`)
        );
    }, intervalMs);
  }
}
