import { DynamicModule, Global, InjectionToken, Module } from "@nestjs/common";
import { ConfigServerService } from "./config-server.service";
import { ConfigServerController } from "./config-server.controller";
import { RepositoryManager } from "./interfaces/repository-manager.interface";
import { ConfigFileModule } from "../config-file/config-file.module";
import { DirectoriesModule } from "../directories/directories.module";

export const CONFIG_SERVER_VALUES: InjectionToken<Record<string, any>> =
  "CONFIG_SERVER_VALUES";

export interface ConfigServerModuleOptions {
  baseRepoPath: string;
  pathDatabase?: string;
  repositories: RepositoryManager[];
}

@Global()
@Module({})
export class ConfigServerModule {
  static forRoot(options: ConfigServerModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: "CONFIG_SERVER_OPTIONS",
      useValue: options,
    };

    return {
      module: ConfigServerModule,
      imports: [ConfigFileModule, DirectoriesModule],
      controllers: [ConfigServerController],
      providers: [ConfigServerService, optionsProvider],
      exports: [ConfigServerService],
    };
  }
}
