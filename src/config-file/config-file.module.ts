import { Module } from "@nestjs/common";
import { ConfigFileController } from "./config-file.controller";
import { ConfigFileService } from "./config-file.service";

@Module({
  controllers: [ConfigFileController],
  providers: [ConfigFileService],
  exports: [ConfigFileService],
})
export class ConfigFileModule {}
