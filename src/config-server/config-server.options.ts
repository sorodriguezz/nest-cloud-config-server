import type { RepositoryManager } from "./interfaces/repository-manager.interface";
import type { ConfigSource } from "./interfaces/config-source.interface";

export interface ConfigServerModuleOptions {
  baseRepoPath: string;
  pathDatabase?: string;
  repositories: RepositoryManager[];
  configSources?: ConfigSource[];
}
