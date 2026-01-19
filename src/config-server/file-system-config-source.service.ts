import { Inject, Injectable } from "@nestjs/common";
import { basename } from "path";
import type { ConfigQuery } from "../common/models/config-query.model";
import { mergeConfigs } from "../common/utils/merge.util";
import { ConfigFileLocator } from "../config-file/config-file.locator";
import { ConfigFileService } from "../config-file/config-file.service";
import { RepositoryRegistry } from "./repository-registry.service";
import type { ConfigSource } from "./interfaces/config-source.interface";
import type { ConfigServerModuleOptions } from "./config-server.options";
import { CONFIG_SERVER_OPTIONS } from "./config-server.tokens";

@Injectable()
export class FileSystemConfigSource implements ConfigSource {
  readonly name = "filesystem";

  constructor(
    private readonly repositoryRegistry: RepositoryRegistry,
    private readonly fileLocator: ConfigFileLocator,
    private readonly fileService: ConfigFileService,
    @Inject(CONFIG_SERVER_OPTIONS)
    private readonly options?: ConfigServerModuleOptions
  ) {}

  async getConfig(query: ConfigQuery): Promise<Record<string, any> | null> {
    if (!this.repositoryRegistry.hasRepository(query.repo)) {
      return null;
    }

    const repositoryPath =
      this.repositoryRegistry.resolveRepositoryPath(query.repo);

    const filePaths = this.fileLocator.findConfigFiles(
      repositoryPath,
      query.application,
      query.profile,
      this.options?.filePatterns
    );

    if (!filePaths.length) {
      return null;
    }

    let mergedConfig: any = null;
    const mergeStrategy = this.options?.mergeStrategy;

    for (const filePath of filePaths) {
      const fileName = basename(filePath);
      const configFile = await this.fileService.readConfigFile(
        repositoryPath,
        fileName
      );

      mergedConfig = mergeConfigs(
        mergedConfig,
        configFile.content ?? {},
        mergeStrategy
      );
    }

    return mergedConfig ?? null;
  }
}
