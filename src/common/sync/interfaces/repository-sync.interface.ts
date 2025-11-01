export interface IRepositorySync {
  sync(): Promise<void>;
  forceSync(): Promise<void>;
  getConfigPath(): string;
}
