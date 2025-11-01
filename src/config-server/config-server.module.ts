import { DynamicModule, Global, InjectionToken, Module } from "@nestjs/common";
import { ConfigServerService } from "./config-server.service";
import { RepositoryManager } from "./interfaces/repository-manager.interface";

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
    const configProvider = {
      provide: CONFIG_SERVER_VALUES,
      useFactory: async () => {
        const configClient = new ConfigServerService();
        return configClient.start(options);
      },
    };

    return {
      module: ConfigServerModule,
      providers: [ConfigServerService, configProvider],
      exports: [CONFIG_SERVER_VALUES],
    };
  }
}
