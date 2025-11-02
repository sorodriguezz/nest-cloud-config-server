import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import type { IConfigFile } from "./interfaces/config-file.interface";

@Injectable()
export class ConfigFileService {
  private readonly logger = new Logger(ConfigFileService.name);

  async readConfigFile(
    repositoryPath: string,
    fileName: string
  ): Promise<IConfigFile> {
    const filePath = path.join(repositoryPath, fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${fileName} not found`);
    }

    const extension = path.extname(fileName).toLowerCase();
    const content = fs.readFileSync(filePath, "utf8");
    const parsedContent = this.parseContent(content, extension);

    return {
      name: fileName,
      content: parsedContent,
      extension: extension.substring(1),
    };
  }

  private parseContent(content: string, extension: string): any {
    try {
      switch (extension.toLowerCase()) {
        case ".json":
          return JSON.parse(content);
        case ".yaml":
        case ".yml":
          // Importación dinámica para yaml
          try {
            const yaml = require("js-yaml");
            return yaml.load(content);
          } catch {
            this.logger.warn("js-yaml not installed, returning raw content");
            return content;
          }
        case ".properties":
          // Importación dinámica para properties
          try {
            const properties = require("properties");
            return properties.parse(content, {
              path: false,
              variables: true,
              sections: true,
              namespace: true,
            });
          } catch {
            this.logger.warn("properties not installed, returning raw content");
            return content;
          }
        case ".xml":
          // Importación dinámica para XML
          try {
            const { XMLParser } = require("fast-xml-parser");
            return new XMLParser().parse(content);
          } catch {
            this.logger.warn(
              "fast-xml-parser not installed, returning raw content"
            );
            return content;
          }
        default:
          return content;
      }
    } catch (error: any) {
      this.logger.error(`Error parsing file: ${error.message}`);
      throw error;
    }
  }
}
