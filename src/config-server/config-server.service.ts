import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ConfigServerModuleOptions } from "./config-server.options";
import { CONFIG_SERVER_OPTIONS } from "./config-server.tokens";
import { RepositoryRegistry } from "./repository-registry.service";
import { RepositorySyncService } from "./repository-sync.service";

@Injectable()
export class ConfigServerService implements OnModuleInit {
  private initialized = false;

  constructor(
    @Inject(CONFIG_SERVER_OPTIONS)
    private readonly options: ConfigServerModuleOptions | undefined,
    private readonly repositoryRegistry: RepositoryRegistry,
    private readonly repositorySyncService: RepositorySyncService
  ) {}

  async onModuleInit() {
    if (this.options && !this.initialized) {
      await this.start(this.options);
      this.initialized = true;
    }
  }

  async start(options: ConfigServerModuleOptions) {
    this.repositoryRegistry.initialize(options);
    await this.repositorySyncService.syncAll();
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
}
