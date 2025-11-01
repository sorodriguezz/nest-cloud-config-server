import { Logger } from "@nestjs/common";
import simpleGit, { type SimpleGit } from "simple-git";
import { RepositoryManager } from "../../config-server/interfaces/repository-manager.interface";
import { IRepositoryUrlBuilder } from "../builders/interfaces/repository-builder.interface";

import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { validateRepository } from "../utils/validate-repository.util";

export class BaseRepositorySync {
  protected readonly logger = new Logger(BaseRepositorySync.name);
  protected git: SimpleGit;

  constructor(protected readonly basePath: string) {
    this.ensureDirectory();

    this.git = simpleGit({ baseDir: this.getConfigPath() });
  }

  private ensureDirectory(): void {
    const dirPath = this.getConfigPath();

    if (!existsSync(dirPath)) {
      this.logger.verbose(`Creating directory: ${dirPath}`);
      mkdirSync(dirPath, { recursive: true });
    }
  }

  public getConfigPath(): string {
    return join(this.basePath, this.repository.repository);
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

  private async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  private async clone(): Promise<void> {
    validateRepository(this.repository);

    this.logger.verbose(`Cloning repository: ${this.repository.repository}`);
    const repoUrl = this.getRepositoryUrl();
    this.logger.debug(`Cloning from URL: ${this.maskSensitiveInfo(repoUrl)}`);

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

  private maskSensitiveInfo(url: string): string {
    return url.replace(/\/\/.*?@/, "//***:***@");
  }

  private async pull(): Promise<void> {
    this.logger.verbose(`Pulling repository: ${this.repository.repository}`);
    await this.git.pull("origin", this.repository.branch);
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
        `Error force syncing repository ${this.repository.name}: ${error.message}`
      );
      throw error;
    }
  }

  private async forcePull(): Promise<void> {
    this.logger.verbose(`Force syncing repository: ${this.repository.name}`);
    await this.git
      .fetch(["--all", "--prune"])
      .reset(["--hard", `origin/${this.repository.branch}`])
      .pull("origin", this.repository.branch);
  }
}
