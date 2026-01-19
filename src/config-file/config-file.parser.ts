import { Inject, Injectable, Optional } from "@nestjs/common";
import { XMLParser } from "fast-xml-parser";
import * as yaml from "js-yaml";
import * as properties from "properties";
import { createLogger, type LoggerLike } from "../common/logging/config-logger";
import type { ConfigServerModuleOptions } from "../config-server/config-server.options";
import { CONFIG_SERVER_OPTIONS } from "../config-server/config-server.tokens";

@Injectable()
export class ConfigFileParser {
  private readonly logger: LoggerLike;

  constructor(
    @Optional()
    @Inject(CONFIG_SERVER_OPTIONS)
    options?: ConfigServerModuleOptions
  ) {
    this.logger = createLogger(
      ConfigFileParser.name,
      options?.enableLogging !== false
    );
  }

  parse(content: string, extension: string): any {
    const normalized = this.normalizeExtension(extension);

    try {
      switch (normalized) {
        case "json":
          return JSON.parse(content);
        case "yaml":
        case "yml":
          return yaml.load(content);
        case "properties":
          return properties.parse(content, {
            path: false,
            variables: true,
            sections: true,
            namespace: true,
          });
        case "xml":
          return new XMLParser().parse(content);
        default:
          return content;
      }
    } catch (error: any) {
      this.logger.error(`Error parsing file: ${error.message}`);
      throw error;
    }
  }

  private normalizeExtension(extension: string): string {
    return extension.startsWith(".") ? extension.slice(1).toLowerCase() : extension.toLowerCase();
  }
}
