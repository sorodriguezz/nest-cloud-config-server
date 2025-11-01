import { Injectable } from "@nestjs/common";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { ConfigServerModuleOptions } from "./config-server.module";

@Injectable()
export class ConfigServerService {
  async start(options: ConfigServerModuleOptions) {}

  private createDirectoryDatabase(path: string) {
    const dbDir = join(process.cwd(), path);

    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
  }
}
