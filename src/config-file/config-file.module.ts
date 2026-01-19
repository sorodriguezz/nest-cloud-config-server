import { Module } from "@nestjs/common";
import { ConfigFileController } from "./config-file.controller";
import { ConfigFileService } from "./config-file.service";
import { ConfigFileLocator } from "./config-file.locator";
import { ConfigFileParser } from "./config-file.parser";

@Module({
  controllers: [ConfigFileController],
  providers: [ConfigFileService, ConfigFileLocator, ConfigFileParser],
  exports: [ConfigFileService, ConfigFileLocator, ConfigFileParser],
})
export class ConfigFileModule {}
