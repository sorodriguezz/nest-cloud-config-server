export type SyncState = "idle" | "in_progress" | "success" | "error";

export interface RepoSyncStatus {
  status: SyncState;
  lastSyncAt?: string;
  lastSyncDurationMs?: number;
  lastError?: string;
}

export interface GlobalSyncStatus extends RepoSyncStatus {
  scope?: "all" | "repository";
  repository?: string;
}

export interface SyncStatusSummary {
  global: GlobalSyncStatus;
  repositories: Record<string, RepoSyncStatus>;
  locks: string[];
}

export interface HealthStatus {
  status: "ok" | "degraded";
  repositoryCount: number;
  sync: SyncStatusSummary;
}
