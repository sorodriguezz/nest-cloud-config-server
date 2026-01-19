import { Inject, Injectable, Logger } from "@nestjs/common";
import type { ConfigQuery } from "../common/models/config-query.model";
import { flattenObject } from "../common/utils/flatten.util";
import type { ConfigSource } from "./interfaces/config-source.interface";
import { CONFIG_SOURCES } from "./config-server.tokens";

@Injectable()
export class ConfigQueryService {
  private readonly logger = new Logger(ConfigQueryService.name);

  constructor(
    @Inject(CONFIG_SOURCES) private readonly sources: ConfigSource[]
  ) {}

  async getConfig(query: ConfigQuery): Promise<Record<string, any>> {
    for (const source of this.sources) {
      try {
        const result = await source.getConfig(query);

        if (result) {
          this.logger.debug(
            `Config resolved from ${source.name ?? source.constructor.name}`
          );
          return flattenObject(result);
        }
      } catch (error: any) {
        this.logger.error(
          `Error resolving config from ${source.name ?? source.constructor.name}: ${error.message}`
        );
        throw error;
      }
    }

    this.logger.warn(
      `No config found for repo=${query.repo} app=${query.application} profile=${query.profile}`
    );
    return {};
  }
}
