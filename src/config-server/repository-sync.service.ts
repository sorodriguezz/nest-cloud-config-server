import { Injectable, Logger } from "@nestjs/common";
import { ManageRepository } from "../manage-repository/manage-repository";
import { RepositoryRegistry } from "./repository-registry.service";

@Injectable()
export class RepositorySyncService {
  private readonly logger = new Logger(RepositorySyncService.name);

  constructor(private readonly repositoryRegistry: RepositoryRegistry) {}

  async syncAll(): Promise<void> {
    const repositories = this.repositoryRegistry.getEntries();

    this.logger.log("Starting repository synchronization...");

    await Promise.all(
      repositories.map((entry) =>
        new ManageRepository(
          entry.repository,
          entry.urlBuilder,
          this.repositoryRegistry.getBaseRepoPath()
        ).sync()
      )
    );

    this.logger.log("Repository synchronization completed");
  }

  async forceSyncAll(): Promise<void> {
    const repositories = this.repositoryRegistry.getEntries();

    this.logger.log("Starting force sync of all repositories...");

    await Promise.all(
      repositories.map((entry) =>
        new ManageRepository(
          entry.repository,
          entry.urlBuilder,
          this.repositoryRegistry.getBaseRepoPath()
        ).forceSync()
      )
    );

    this.logger.log("Force sync completed");
  }
}
