import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
} from "@nestjs/common";
import { basename, join, resolve, sep } from "path";
import { ConfigServerService } from "../config-server/config-server.service";
import { ConfigFileService } from "./config-file.service";
import type { ConfigQueryDto } from "./dto/config-query.dto";
import { flattenObject } from "../common/utils/flatten.util";

@Controller("config-file")
export class ConfigFileController {
  private readonly logger = new Logger(ConfigFileController.name);

  constructor(
    private readonly configFileService: ConfigFileService,
    private readonly configServerService: ConfigServerService
  ) {}

  @Get()
  async getConfig(@Query() query: ConfigQueryDto) {
    const { repo, application, profile } = query;

    if (!repo || !application || !profile) {
      this.logger.error("Missing required parameters");
      throw new BadRequestException("Missing required parameters");
    }

    this.logger.debug(
      `Fetching config for repo: ${repo}, application: ${application}, profile: ${profile}`
    );

    const baseRepoPath = this.configServerService.getBaseRepoPath();
    const repositoryPath = resolve(baseRepoPath, repo);

    // Buscar archivos con patrón: application-profile.*
    const pattern = join(repositoryPath, `${application}-${profile}.*`)
      .split(sep)
      .join("/");

    // Importación dinámica de glob
    let matchedFiles: string[] = [];
    try {
      const { globSync } = require("glob");
      matchedFiles = globSync(pattern, { nodir: true });
    } catch {
      this.logger.warn("glob not installed, trying basic file search");
      // Fallback: intentar buscar archivos JSON básicos
      const fs = require("fs");
      const possibleFiles = [
        `${application}-${profile}.json`,
        `${application}-${profile}.yaml`,
        `${application}-${profile}.yml`,
        `${application}-${profile}.properties`,
        `${application}-${profile}.xml`,
      ];

      for (const file of possibleFiles) {
        const filePath = join(repositoryPath, file);
        if (fs.existsSync(filePath)) {
          matchedFiles.push(filePath);
          break;
        }
      }
    }

    const filePath = matchedFiles[0];

    if (!filePath) {
      this.logger.warn(
        `No config file found for ${application}-${profile} in repo ${repo}`
      );
      return {};
    }

    const fileName = basename(filePath);

    const config = await this.configFileService.readConfigFile(
      repositoryPath,
      fileName
    );

    // Aplanar el objeto antes de retornarlo
    return flattenObject(config.content);
  }
}
