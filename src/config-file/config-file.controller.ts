import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Headers,
  Res,
  Inject,
  Optional,
} from "@nestjs/common";
import type { ConfigQueryDto } from "./dto/config-query.dto";
import { ConfigQueryService } from "../config-server/config-query.service";
import { matchEtag } from "../common/utils/etag.util";
import { createLogger, type LoggerLike } from "../common/logging/config-logger";
import type { ConfigServerModuleOptions } from "../config-server/config-server.options";
import { CONFIG_SERVER_OPTIONS } from "../config-server/config-server.tokens";

type HttpResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => void;
};

@Controller("config-file")
export class ConfigFileController {
  private readonly logger: LoggerLike;

  constructor(
    private readonly configQueryService: ConfigQueryService,
    @Optional()
    @Inject(CONFIG_SERVER_OPTIONS)
    options?: ConfigServerModuleOptions
  ) {
    this.logger = createLogger(
      ConfigFileController.name,
      options?.enableLogging !== false
    );
  }

  @Get()
  async getConfig(
    @Query() query: ConfigQueryDto,
    @Headers("if-none-match") ifNoneMatch: string | undefined,
    @Res({ passthrough: true }) res: HttpResponse
  ) {
    this.logger.debug(
      `Fetching config for repo: ${query.repo}, application: ${query.application}, profile: ${query.profile}`
    );

    const result = await this.configQueryService.getConfigWithMetadata(query);

    res.setHeader("ETag", result.etag);

    if (matchEtag(ifNoneMatch, result.etag)) {
      res.status(HttpStatus.NOT_MODIFIED);
      return;
    }

    return result.data;
  }
}
