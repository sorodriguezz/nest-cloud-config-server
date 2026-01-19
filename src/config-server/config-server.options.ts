import type { RepositoryManager } from "./interfaces/repository-manager.interface";
import type { ConfigSource } from "./interfaces/config-source.interface";
import type { MergeStrategy } from "../common/utils/merge.util";

export type ConfigSourceStrategy = "first" | "merge";
export type ConfigSourceOrder = "filesystem-first" | "filesystem-last";

export interface ConfigServerModuleOptions {
  baseRepoPath: string;
  repositories: RepositoryManager[];
  configSources?: ConfigSource[];
  enableLogging?: boolean;
  sourceStrategy?: ConfigSourceStrategy;
  sourceOrder?: ConfigSourceOrder;
  mergeStrategy?: MergeStrategy;
  filePatterns?: string[];
  cacheTtlMs?: number;
  syncIntervalMs?: number;
}
