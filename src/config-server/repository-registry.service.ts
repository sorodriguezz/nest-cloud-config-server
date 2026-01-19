import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { join } from "path";
import { RepositoryBuilderFactory } from "../common/factories/repository-builder.factory";
import type { IRepositoryUrlBuilder } from "../common/builders/interfaces/repository-builder.interface";
import type { RepositoryManager } from "./interfaces/repository-manager.interface";
import type { ConfigServerModuleOptions } from "./config-server.options";
import { CONFIG_SERVER_OPTIONS } from "./config-server.tokens";

export interface RepositoryEntry {
  repository: RepositoryManager;
  urlBuilder: IRepositoryUrlBuilder;
}

@Injectable()
export class RepositoryRegistry {
  private readonly logger = new Logger(RepositoryRegistry.name);
  private readonly entries: RepositoryEntry[] = [];
  private baseRepoPath = "";
  private initialized = false;

  constructor(
    @Inject(CONFIG_SERVER_OPTIONS)
    private readonly options?: ConfigServerModuleOptions
  ) {
    if (this.options) {
      this.initialize(this.options);
    }
  }

  initialize(options: ConfigServerModuleOptions): void {
    if (this.initialized) {
      return;
    }

    this.baseRepoPath = options.baseRepoPath;

    const builderFactory = new RepositoryBuilderFactory();
    const repositories = options.repositories ?? [];

    repositories.forEach((repository) => {
      const urlBuilder = builderFactory.getBuilder(repository.name);
      this.entries.push({ repository, urlBuilder });
    });

    this.initialized = true;
    this.logger.debug(`Registered ${this.entries.length} repositories`);
  }

  getBaseRepoPath(): string {
    return this.baseRepoPath;
  }

  getEntries(): RepositoryEntry[] {
    return [...this.entries];
  }

  getRepositories() {
    return this.entries.map((repo) => ({
      name: repo.repository.name,
      host: repo.repository.host,
      organization: repo.repository.organization,
      repository: repo.repository.repository,
      branch: repo.repository.branch,
      hasAuth: !!repo.repository.auth,
    }));
  }

  resolveRepositoryPath(repoName: string): string {
    const entry = this.entries.find(
      (repo) => repo.repository.repository === repoName
    );

    if (!entry) {
      throw new NotFoundException(`Repository ${repoName} not configured`);
    }

    return join(this.baseRepoPath, entry.repository.repository);
  }

  hasRepository(repoName: string): boolean {
    return this.entries.some(
      (repo) => repo.repository.repository === repoName
    );
  }
}
