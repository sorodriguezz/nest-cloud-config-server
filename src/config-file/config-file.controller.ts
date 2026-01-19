import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
} from "@nestjs/common";
import type { ConfigQueryDto } from "./dto/config-query.dto";
import { ConfigQueryService } from "../config-server/config-query.service";

@Controller("config-file")
export class ConfigFileController {
  private readonly logger = new Logger(ConfigFileController.name);

  constructor(private readonly configQueryService: ConfigQueryService) {}

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

    return this.configQueryService.getConfig(query);
  }
}
