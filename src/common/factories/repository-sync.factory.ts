import { RepositoryManager } from "../../config-server/interfaces/repository-manager.interface";
import { BaseRepositorySync } from "../sync/base-repository-sync";
import { IRepositorySync } from "../sync/interfaces/repository-sync.interface";
import type { RepositoryBuilderFactory } from "./repository-builder.factory";

export class RepositorySyncFactory {
  constructor(
    private readonly repositories: RepositoryManager[],
    private readonly builderFactory: RepositoryBuilderFactory,
    private readonly basePath: string
  ) {}

  createSyncers(): IRepositorySync[] {
    return this.repositories.map((repo: RepositoryManager) => {
      const urlBuilder = this.builderFactory.getBuilder(repo.name);

      return new (class extends BaseRepositorySync {
        protected getRepositoryUrl(): string {
          const url = this.urlBuilder
            .setHost(repo.host)
            .setProtocol(repo.protocol)
            .setOrganization(repo.organization)
            .setRepository(repo.repository);

          if (repo.auth) {
            url.setAsPublic(false);
            url.setCredentials(repo.auth.username, repo.auth.token);
          } else {
            url.setAsPublic(true);
          }

          return url.build();
        }
      })(repo, urlBuilder, this.basePath);
    });
  }
}
