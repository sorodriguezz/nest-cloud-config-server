import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { promises as fs } from "fs";
import * as path from "path";
import type { IConfigFile } from "./interfaces/config-file.interface";
import { ConfigFileParser } from "./config-file.parser";

@Injectable()
export class ConfigFileService {
  private readonly logger = new Logger(ConfigFileService.name);

  constructor(private readonly parser: ConfigFileParser) {}

  async readConfigFile(
    repositoryPath: string,
    fileName: string
  ): Promise<IConfigFile> {
    const filePath = path.join(repositoryPath, fileName);

    if (!(await this.fileExists(filePath))) {
      throw new NotFoundException(`File ${fileName} not found`);
    }

    const extension = path.extname(fileName).toLowerCase();
    const content = await fs.readFile(filePath, "utf8");
    const parsedContent = this.parser.parse(content, extension);

    return {
      name: fileName,
      content: parsedContent,
      extension: extension.substring(1),
    };
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      this.logger.warn(`File does not exist: ${filePath}`);
      return false;
    }
  }
}
