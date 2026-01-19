import { Injectable } from "@nestjs/common";
import { basename } from "path";
import type { ConfigQuery } from "../common/models/config-query.model";
import { ConfigFileLocator } from "../config-file/config-file.locator";
import { ConfigFileService } from "../config-file/config-file.service";
import { RepositoryRegistry } from "./repository-registry.service";
import type { ConfigSource } from "./interfaces/config-source.interface";

@Injectable()
export class FileSystemConfigSource implements ConfigSource {
  readonly name = "filesystem";

  constructor(
    private readonly repositoryRegistry: RepositoryRegistry,
    private readonly fileLocator: ConfigFileLocator,
    private readonly fileService: ConfigFileService
  ) {}

  async getConfig(query: ConfigQuery): Promise<Record<string, any> | null> {
    if (!this.repositoryRegistry.hasRepository(query.repo)) {
      return null;
    }

    const repositoryPath =
      this.repositoryRegistry.resolveRepositoryPath(query.repo);

    const filePath = this.fileLocator.findConfigFile(
      repositoryPath,
      query.application,
      query.profile
    );

    if (!filePath) {
      return null;
    }

    const fileName = basename(filePath);
    const configFile = await this.fileService.readConfigFile(
      repositoryPath,
      fileName
    );

    return configFile.content ?? null;
  }
}
