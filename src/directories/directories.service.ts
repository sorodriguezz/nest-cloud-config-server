import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { ConfigServerService } from "../config-server/config-server.service";

@Injectable()
export class DirectoriesService {
  private readonly logger = new Logger(DirectoriesService.name);

  constructor(private readonly configServerService: ConfigServerService) {}

  listDirectories(): { name: string; files: any[] }[] {
    try {
      const baseRepoPath = this.configServerService.getBaseRepoPath();

      if (!fs.existsSync(baseRepoPath)) {
        this.logger.warn(`Path does not exist: ${baseRepoPath}`);
        return [];
      }

      const items = fs.readdirSync(baseRepoPath);

      const directories: any = items
        .filter((item) => {
          try {
            const fullPath = path.join(baseRepoPath, item);
            return fs.statSync(fullPath).isDirectory();
          } catch (error) {
            return false;
          }
        })
        .map((dirName) => {
          const dirPath = path.join(baseRepoPath, dirName);

          let files: any = [];
          try {
            files = fs
              .readdirSync(dirPath)
              .filter((file) => {
                try {
                  if (file.startsWith(".")) return false;
                  return fs.statSync(path.join(dirPath, file)).isFile();
                } catch (error) {
                  return false;
                }
              })
              .map((fileName) => {
                try {
                  return fileName;
                } catch (error: any) {
                  return {
                    name: fileName,
                    error: error.message,
                  };
                }
              });
          } catch (error: any) {
            this.logger.warn(
              `Error reading files in directory ${dirName}: ${error.message}`
            );
          }

          return {
            name: dirName,
            files: files,
          };
        });
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
}
