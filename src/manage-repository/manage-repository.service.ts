import { Injectable, Logger } from "@nestjs/common";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import simpleGit, { type SimpleGit } from "simple-git";
import { RepositoryManager } from "../config-server/interfaces/repository-manager.interface";
import { IRepositoryUrlBuilder } from "../common/builders/interfaces/repository-builder.interface";
import { validateRepository } from "../common/utils/validate-repository.util";

@Injectable()
export class ManageRepositoryService {
  private readonly logger = new Logger(ManageRepositoryService.name);
  public git: SimpleGit;

  constructor(
    private readonly repository: RepositoryManager,
    private readonly basePath: string,
    private readonly urlBuilder: IRepositoryUrlBuilder
  ) {
    this.git = simpleGit({
      baseDir: this.getConfigPath(this.basePath, this.repository.repository),
    });
  }

  private ensureDirectory(): void {
    const dirPath = this.getConfigPath(
      this.basePath,
      this.repository.repository
    );

    if (!existsSync(dirPath)) {
      this.logger.verbose(`Creating directory: ${dirPath}`);
      mkdirSync(dirPath, { recursive: true });
    }
  }

  private async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  public getConfigPath(pathRepositories: string, repository: string): string {
    return join(pathRepositories, repository);
  }

  private async pull(): Promise<void> {
    this.logger.verbose(`Pulling repository: ${this.repository.repository}`);
    await this.git.pull("origin", this.repository.branch);
  }

  public async sync(): Promise<void> {
    try {
      const isRepo = await this.isGitRepository();

      if (isRepo) {
        await this.pull();
      } else {
        await this.clone();
      }
    } catch (error: any) {
      this.logger.error(
        `Error syncing repository ${this.repository.name}: ${error.message}`
      );
      throw error;
    }
  }

  private async clone(): Promise<void> {
    validateRepository(this.repository);

    this.logger.verbose(`Cloning repository: ${this.repository.repository}`);

    const repoUrl = this.getRepositoryUrl();

    this.logger.debug(
      `Cloning from URL: ${repoUrl.replace(/\/\/.*?@/, "//***:***@")}`
    );

    const parentGit = simpleGit({ baseDir: this.basePath });
    await parentGit.clone(repoUrl, this.repository.repository, [
      "--branch",
      this.repository.branch,
    ]);
  }

  protected getRepositoryUrl(): string {
    validateRepository(this.repository);

    return this.urlBuilder
      .setAsPublic(false)
      .setCredentials(
        this.repository.auth?.username || "",
        this.repository.auth?.token || ""
      )
      .setHost(this.repository.host)
      .setOrganization(this.repository.organization)
      .setRepository(this.repository.repository)
      .build();
  }
}
