import { Inject, Injectable, Optional } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { RepositoryRegistry } from "../config-server/repository-registry.service";
import { createLogger, type LoggerLike } from "../common/logging/config-logger";
import type { ConfigServerModuleOptions } from "../config-server/config-server.options";
import { CONFIG_SERVER_OPTIONS } from "../config-server/config-server.tokens";

@Injectable()
export class DirectoriesService {
  private readonly logger: LoggerLike;

  constructor(
    private readonly repositoryRegistry: RepositoryRegistry,
    @Optional()
    @Inject(CONFIG_SERVER_OPTIONS)
    options?: ConfigServerModuleOptions
  ) {
    this.logger = createLogger(
      DirectoriesService.name,
      options?.enableLogging !== false
    );
  }

  listDirectories(): { name: string; files: string[] }[] {
    try {
      const baseRepoPath = this.repositoryRegistry.getBaseRepoPath();

      if (!fs.existsSync(baseRepoPath)) {
        this.logger.warn(`Path does not exist: ${baseRepoPath}`);
        return [];
      }

      const items = fs.readdirSync(baseRepoPath, { withFileTypes: true });

      const directories = items
        .filter((item) => item.isDirectory())
        .map((dir) => this.mapDirectory(baseRepoPath, dir.name));

      this.logger.debug("Directories found");
      return directories;
    } catch (error: any) {
      this.logger.error(
        `Error listing directories: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private mapDirectory(baseRepoPath: string, dirName: string) {
    const dirPath = path.join(baseRepoPath, dirName);

    let files: string[] = [];
    try {
      files = fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
        .map((entry) => entry.name);
    } catch (error: any) {
      this.logger.warn(
        `Error reading files in directory ${dirName}: ${error.message}`
      );
    }

    return {
      name: dirName,
      files,
    };
  }
}
