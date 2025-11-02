import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ConfigServerService } from "./config-server.service";

@Controller()
export class ConfigServerController {
  constructor(private readonly configServerService: ConfigServerService) {}

  /**
   * Sincroniza todos los repositorios de forma forzada
   */
  @Post("sync")
  @HttpCode(HttpStatus.OK)
  async forceSync() {
    await this.configServerService.forceSyncRepositories();
    return { message: "Repositories synchronized successfully" };
  }
}
