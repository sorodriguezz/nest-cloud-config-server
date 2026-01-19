import { Inject, Injectable } from "@nestjs/common";
import type { ConfigQuery } from "../common/models/config-query.model";
import { validateConfigQuery } from "../common/utils/config-query.util";
import { generateEtag } from "../common/utils/etag.util";
import { flattenObject } from "../common/utils/flatten.util";
import { mergeConfigs } from "../common/utils/merge.util";
import { createLogger, type LoggerLike } from "../common/logging/config-logger";
import type { ConfigSource } from "./interfaces/config-source.interface";
import type { ConfigServerModuleOptions } from "./config-server.options";
import { CONFIG_SOURCES, CONFIG_SERVER_OPTIONS } from "./config-server.tokens";

interface ConfigQueryResult {
  data: Record<string, any>;
  etag: string;
  sources: string[];
  cacheHit: boolean;
}

interface CacheEntry {
  result: Omit<ConfigQueryResult, "cacheHit">;
  expiresAt?: number;
}

@Injectable()
export class ConfigQueryService {
  private readonly logger: LoggerLike;

  constructor(
    @Inject(CONFIG_SOURCES) private readonly sources: ConfigSource[],
    @Inject(CONFIG_SERVER_OPTIONS)
    private readonly options?: ConfigServerModuleOptions
  ) {
    this.logger = createLogger(
      ConfigQueryService.name,
      this.options?.enableLogging !== false
    );
  }

  async getConfig(query: ConfigQuery): Promise<Record<string, any>> {
    const result = await this.getConfigWithMetadata(query);
    return result.data;
  }

  async getConfigWithMetadata(query: ConfigQuery): Promise<ConfigQueryResult> {
    validateConfigQuery(query);

    const cacheKey = this.getCacheKey(query);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const sourceStrategy = this.options?.sourceStrategy ?? "first";
    const mergeStrategy = this.options?.mergeStrategy;

    let mergedResult: any = null;
    const sourcesUsed: string[] = [];

    for (const source of this.sources) {
      try {
        const result = await source.getConfig(query);
        const sourceName = source.name ?? source.constructor.name;

        if (!result) {
          continue;
        }

        sourcesUsed.push(sourceName);

        if (sourceStrategy === "first") {
          mergedResult = result;
          this.logger.debug(`Config resolved from ${sourceName}`);
          break;
        }

        mergedResult = mergeConfigs(mergedResult, result, mergeStrategy);
      } catch (error: any) {
        this.logger.error(
          `Error resolving config from ${source.name ?? source.constructor.name}: ${error.message}`
        );
        throw error;
      }
    }

    if (!mergedResult) {
      this.logger.warn(
        `No config found for repo=${query.repo} app=${query.application} profile=${query.profile}`
      );
      mergedResult = {};
    }

    const flattened = flattenObject(mergedResult);
    const etag = generateEtag(flattened);

    const result: ConfigQueryResult = {
      data: flattened,
      etag,
      sources: sourcesUsed,
      cacheHit: false,
    };

    this.storeInCache(cacheKey, result);

    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private readonly cache = new Map<string, CacheEntry>();

  private getCacheKey(query: ConfigQuery): string {
    return `${query.repo}:${query.application}:${query.profile}`;
  }

  private getFromCache(cacheKey: string): ConfigQueryResult | null {
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }

    return { ...entry.result, cacheHit: true };
  }

  private storeInCache(cacheKey: string, result: ConfigQueryResult): void {
    const ttl = this.options?.cacheTtlMs;

    if (!ttl || ttl <= 0) {
      return;
    }

    const entry: CacheEntry = {
      result: {
        data: result.data,
        etag: result.etag,
        sources: result.sources,
      },
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(cacheKey, entry);
  }
}
