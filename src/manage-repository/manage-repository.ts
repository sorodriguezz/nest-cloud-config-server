import { BadGatewayException } from "@nestjs/common";
import simpleGit, { type SimpleGit } from "simple-git";
import { IRepositoryUrlBuilder } from "../common/builders/interfaces/repository-builder.interface";
import { createLogger, type LoggerLike } from "../common/logging/config-logger";
import {
  ensureDirectory,
  getConfigPath,
  getRepositoryUrl,
} from "../common/utils/directories.util";
import { validateRepository } from "../common/utils/validations.util";
import { RepositoryManager } from "../config-server/interfaces/repository-manager.interface";

export class ManageRepository {
  private readonly logger: LoggerLike;
  public git!: SimpleGit;

  constructor(
    private readonly _repository: RepositoryManager,
    private readonly _urlBuilder: IRepositoryUrlBuilder,
    private readonly _basePath: string,
    logger?: LoggerLike
  ) {
    this.logger = logger ?? createLogger(ManageRepository.name, true);
    ensureDirectory(this._basePath, this._repository.repository, this.logger);
    this.initGit();
  }

  public initGit(): void {
    this.git = simpleGit({
      baseDir: getConfigPath(this._basePath, this._repository.repository),
    });
  }

  public async pull(): Promise<void> {
    this.logger.verbose(`Pulling repository: ${this._repository.repository}`);
    await this.git.pull("origin", this._repository.branch);
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
        `Error syncing repository ${this._repository.name}: ${error.message}`
      );
      throw error;
    }
  }

  public async clone(): Promise<void> {
    validateRepository(this._repository);

    this.logger.verbose(`Cloning repository: ${this._repository.repository}`);

    const repoUrl = getRepositoryUrl(this._repository, this._urlBuilder);

    this.logger.debug(
      `Cloning from URL: ${repoUrl.replace(/\/\/.*?@/, "//***:***@")}`
    );

    const parentGit = simpleGit({ baseDir: this._basePath });

    await parentGit.clone(repoUrl, this._repository.repository, [
      "--branch",
      this._repository.branch,
    ]);
  }

  public async forceSync(): Promise<void> {
    try {
      const isRepo = await this.isGitRepository();

      if (isRepo) {
        await this.forcePull();
      } else {
        await this.clone();
      }
    } catch (error: any) {
      this.logger.error(
        `Error force syncing repository ${this._repository.name}: ${error.message}`
      );
      throw new BadGatewayException(error.message);
    }
  }

  private async forcePull(): Promise<void> {
    this.logger.verbose(`Force syncing repository: ${this._repository.name}`);

    await this.git
      .fetch(["--all", "--prune"])
      .reset(["--hard", `origin/${this._repository.branch}`])
      .pull("origin", this._repository.branch);
  }

  public async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }
}
