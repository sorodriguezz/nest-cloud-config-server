import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { ConfigServerModuleOptions } from "./config-server.module";
import { RepositoryManager } from "./interfaces/repository-manager.interface";
import { RepositoryBuilderFactory } from "../common/factories/repository-builder.factory";
import { ManageRepository } from "../manage-repository/manage-repository";

@Injectable()
export class ConfigServerService implements OnModuleInit {
  private readonly logger = new Logger(ConfigServerService.name);
  private readonly repositories: any[] = [];
  private baseRepoPath: string = "";
  private initialized = false;

  constructor(
    @Inject("CONFIG_SERVER_OPTIONS")
    private readonly options?: ConfigServerModuleOptions
  ) {}

  async onModuleInit() {
    if (this.options && !this.initialized) {
      await this.start(this.options);
      this.initialized = true;
    }
  }

  async start(options: ConfigServerModuleOptions) {
    this.baseRepoPath = options.baseRepoPath;
    this.mapRepositories(options);

    await this.syncAllRepositories();
  }

  private mapRepositories(options: ConfigServerModuleOptions) {
    const repositories = options.repositories;
    const builder = new RepositoryBuilderFactory();
    const baseRepoPath = options.baseRepoPath;

    const resp = repositories.map((repository: RepositoryManager) => {
      const urlBuilder = builder.getBuilder(repository.name);

      return { repository, urlBuilder, pathBase: baseRepoPath };
    });

    this.repositories.push(...resp);
  }

  private async syncAllRepositories(): Promise<void> {
    this.logger.log("Starting repository synchronization...");

    await Promise.all(
      this.repositories.map((repo) =>
        new ManageRepository(
          repo.repository,
          repo.urlBuilder,
          repo.pathBase
        ).sync()
      )
    );

    this.logger.log("Repository synchronization completed");
  }

  private createDirectoryDatabase(path: string) {
    const dbDir = join(process.cwd(), path);

    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
  }

  /**
   * Obtiene la lista de repositorios configurados
   */
  public getRepositories() {
    return this.repositories.map((repo) => ({
      name: repo.repository.name,
      host: repo.repository.host,
      organization: repo.repository.organization,
      repository: repo.repository.repository,
      branch: repo.repository.branch,
      hasAuth: !!repo.repository.auth,
    }));
  }

  /**
   * Sincroniza todos los repositorios de forma forzada
   */
  public async forceSyncRepositories(): Promise<void> {
    this.logger.log("Starting force sync of all repositories...");

    await Promise.all(
      this.repositories.map((repo) =>
        new ManageRepository(
          repo.repository,
          repo.urlBuilder,
          repo.pathBase
        ).forceSync()
      )
    );

    this.logger.log("Force sync completed");
  }

  /**
   * Expone la ruta base de los repositorios
   */
  public getBaseRepoPath(): string {
    return this.baseRepoPath;
  }

  /**
   * Expone los repositorios internos
   */
  public getRepositoriesInternal(): any[] {
    return this.repositories;
  }
}
