import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ConfigServerService } from "./config-server.service";
import { assertSafeToken } from "../common/utils/config-query.util";

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

  /**
   * Sincroniza un repositorio específico
   */
  @Post("sync/:repo")
  @HttpCode(HttpStatus.OK)
  async syncRepository(
    @Param("repo") repo: string,
    @Query("force") force?: string
  ) {
    assertSafeToken(repo, "repo");

    const shouldForce = force === "true";
    await this.configServerService.syncRepository(repo, shouldForce);
    return { message: "Repository synchronized successfully" };
  }

  /**
   * Estado de salud del servicio
   */
  @Get("health")
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return this.configServerService.getHealthStatus();
  }
}
