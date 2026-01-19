import {
  ConflictException,
  Inject,
  Injectable,
  Optional,
} from "@nestjs/common";
import { ManageRepository } from "../manage-repository/manage-repository";
import { RepositoryRegistry, type RepositoryEntry } from "./repository-registry.service";
import { createLogger, type LoggerLike } from "../common/logging/config-logger";
import type {
  GlobalSyncStatus,
  RepoSyncStatus,
  SyncStatusSummary,
} from "./interfaces/sync-status.interface";
import type { ConfigServerModuleOptions } from "./config-server.options";
import { CONFIG_SERVER_OPTIONS } from "./config-server.tokens";

@Injectable()
export class RepositorySyncService {
  private readonly logger: LoggerLike;
  private readonly loggingEnabled: boolean;
  private readonly locks = new Set<string>();
  private readonly repoStatuses = new Map<string, RepoSyncStatus>();
  private globalStatus: GlobalSyncStatus = { status: "idle" };
  private readonly allLockKey = "__all__";

  constructor(
    private readonly repositoryRegistry: RepositoryRegistry,
    @Optional()
    @Inject(CONFIG_SERVER_OPTIONS)
    options?: ConfigServerModuleOptions
  ) {
    this.loggingEnabled = options?.enableLogging !== false;
    this.logger = createLogger(
      RepositorySyncService.name,
      this.loggingEnabled
    );
  }

  async syncAll(): Promise<void> {
    const repositories = this.repositoryRegistry.getEntries();

    await this.runWithLock(this.allLockKey, async () => {
      this.logger.log("Starting repository synchronization...");
      const startTime = Date.now();
      this.updateGlobalStatus({ status: "in_progress", scope: "all" });

      const results = await Promise.allSettled(
        repositories.map((entry) => this.syncEntry(entry, false))
      );

      const errors = results.filter(
        (result) => result.status === "rejected"
      ) as PromiseRejectedResult[];

      const duration = Date.now() - startTime;
      const lastSyncAt = new Date().toISOString();

      if (errors.length) {
        const errorMessage = errors[0]?.reason?.message ?? "Sync failed";
        this.updateGlobalStatus({
          status: "error",
          lastSyncAt,
          lastSyncDurationMs: duration,
          lastError: errorMessage,
          scope: "all",
        });
        this.logger.error(`Repository sync failed: ${errorMessage}`);
        throw errors[0].reason;
      }

      this.updateGlobalStatus({
        status: "success",
        lastSyncAt,
        lastSyncDurationMs: duration,
        scope: "all",
      });
      this.logger.log("Repository synchronization completed");
    });
  }

  async forceSyncAll(): Promise<void> {
    const repositories = this.repositoryRegistry.getEntries();

    await this.runWithLock(this.allLockKey, async () => {
      this.logger.log("Starting force sync of all repositories...");
      const startTime = Date.now();
      this.updateGlobalStatus({ status: "in_progress", scope: "all" });

      const results = await Promise.allSettled(
        repositories.map((entry) => this.syncEntry(entry, true))
      );

      const errors = results.filter(
        (result) => result.status === "rejected"
      ) as PromiseRejectedResult[];

      const duration = Date.now() - startTime;
      const lastSyncAt = new Date().toISOString();

      if (errors.length) {
        const errorMessage = errors[0]?.reason?.message ?? "Force sync failed";
        this.updateGlobalStatus({
          status: "error",
          lastSyncAt,
          lastSyncDurationMs: duration,
          lastError: errorMessage,
          scope: "all",
        });
        this.logger.error(`Force sync failed: ${errorMessage}`);
        throw errors[0].reason;
      }

      this.updateGlobalStatus({
        status: "success",
        lastSyncAt,
        lastSyncDurationMs: duration,
        scope: "all",
      });
      this.logger.log("Force sync completed");
    });
  }

  async syncRepository(repoName: string, force = false): Promise<void> {
    const entry = this.repositoryRegistry.getEntry(repoName);
    const lockKey = `repo:${repoName}`;

    await this.runWithLock(lockKey, async () => {
      const startTime = Date.now();
      this.updateGlobalStatus({
        status: "in_progress",
        scope: "repository",
        repository: repoName,
      });
      this.setRepoStatus(repoName, { status: "in_progress" });

      try {
        await this.syncEntry(entry, force);

        const duration = Date.now() - startTime;
        const lastSyncAt = new Date().toISOString();

        this.updateGlobalStatus({
          status: "success",
          lastSyncAt,
          lastSyncDurationMs: duration,
          scope: "repository",
          repository: repoName,
        });
      } catch (error: any) {
        const duration = Date.now() - startTime;
        const lastSyncAt = new Date().toISOString();

        this.updateGlobalStatus({
          status: "error",
          lastSyncAt,
          lastSyncDurationMs: duration,
          lastError: error.message,
          scope: "repository",
          repository: repoName,
        });
        throw error;
      }
    });
  }

  getStatus(): SyncStatusSummary {
    const repositories: Record<string, RepoSyncStatus> = {};

    this.repoStatuses.forEach((status, repoName) => {
      repositories[repoName] = { ...status };
    });

    const summary: SyncStatusSummary = {
      global: { ...this.globalStatus },
      repositories,
      locks: Array.from(this.locks),
    };

    return summary;
  }

  private async syncEntry(entry: RepositoryEntry, force: boolean): Promise<void> {
    const repoName = entry.repository.repository;
    const startTime = Date.now();
    this.setRepoStatus(repoName, { status: "in_progress" });

    try {
      const manager = new ManageRepository(
        entry.repository,
        entry.urlBuilder,
        this.repositoryRegistry.getBaseRepoPath(),
        createLogger(ManageRepository.name, this.loggingEnabled)
      );

      if (force) {
        await manager.forceSync();
      } else {
        await manager.sync();
      }

      const duration = Date.now() - startTime;
      this.setRepoStatus(repoName, {
        status: "success",
        lastSyncAt: new Date().toISOString(),
        lastSyncDurationMs: duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.setRepoStatus(repoName, {
        status: "error",
        lastSyncAt: new Date().toISOString(),
        lastSyncDurationMs: duration,
        lastError: error.message,
      });
      throw error;
    }
  }

  private runWithLock(lockKey: string, action: () => Promise<void>) {
    this.ensureLockAvailable(lockKey);
    this.locks.add(lockKey);

    return action().finally(() => {
      this.locks.delete(lockKey);
    });
  }

  private ensureLockAvailable(lockKey: string): void {
    if (lockKey === this.allLockKey && this.locks.size > 0) {
      throw new ConflictException("Repository sync already in progress");
    }

    if (lockKey !== this.allLockKey && this.locks.has(this.allLockKey)) {
      throw new ConflictException("Global sync already in progress");
    }

    if (this.locks.has(lockKey)) {
      throw new ConflictException("Sync already in progress for repository");
    }
  }

  private setRepoStatus(repoName: string, update: Partial<RepoSyncStatus>) {
    const current = this.repoStatuses.get(repoName) ?? { status: "idle" };
    this.repoStatuses.set(repoName, { ...current, ...update });
  }

  private updateGlobalStatus(update: Partial<GlobalSyncStatus>) {
    this.globalStatus = { ...this.globalStatus, ...update };
  }
}
