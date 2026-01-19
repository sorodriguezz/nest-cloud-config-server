import type { InjectionToken } from "@nestjs/common";
import type { ConfigServerModuleOptions } from "./config-server.options";
import type { ConfigSource } from "./interfaces/config-source.interface";

export const CONFIG_SERVER_OPTIONS: InjectionToken<ConfigServerModuleOptions> =
  "CONFIG_SERVER_OPTIONS";
export const CONFIG_SOURCES: InjectionToken<ConfigSource[]> = "CONFIG_SOURCES";
