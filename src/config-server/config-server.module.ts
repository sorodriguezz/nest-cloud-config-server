import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigServerService } from "./config-server.service";
import { ConfigServerController } from "./config-server.controller";
import { ConfigFileModule } from "../config-file/config-file.module";
import { DirectoriesModule } from "../directories/directories.module";
import { ConfigQueryService } from "./config-query.service";
import { FileSystemConfigSource } from "./file-system-config-source.service";
import { RepositoryRegistry } from "./repository-registry.service";
import { RepositorySyncService } from "./repository-sync.service";
import type { ConfigServerModuleOptions } from "./config-server.options";
import { CONFIG_SOURCES, CONFIG_SERVER_OPTIONS } from "./config-server.tokens";

@Global()
@Module({})
export class ConfigServerModule {
  static forRoot(options: ConfigServerModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: CONFIG_SERVER_OPTIONS,
      useValue: options,
    };

    const configSourcesProvider = {
      provide: CONFIG_SOURCES,
      useFactory: (fileSource: FileSystemConfigSource) => {
        const extraSources = options.configSources ?? [];
        const sourceOrder = options.sourceOrder ?? "filesystem-first";

        return sourceOrder === "filesystem-first"
          ? [fileSource, ...extraSources]
          : [...extraSources, fileSource];
      },
      inject: [FileSystemConfigSource],
    };

    return {
      module: ConfigServerModule,
      imports: [ConfigFileModule, DirectoriesModule],
      controllers: [ConfigServerController],
      providers: [
        ConfigServerService,
        ConfigQueryService,
        RepositoryRegistry,
        RepositorySyncService,
        FileSystemConfigSource,
        optionsProvider,
        configSourcesProvider,
      ],
      exports: [ConfigServerService, ConfigQueryService, RepositoryRegistry],
    };
  }
}

export * from "./config-server.options";
export * from "./config-server.tokens";
