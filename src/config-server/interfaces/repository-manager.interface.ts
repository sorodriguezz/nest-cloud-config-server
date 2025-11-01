import type { RepositoryType } from "../../common/factories/repository-builder.factory";

export interface RepositoryManager {
  name: RepositoryType;
  host: string;
  protocol: string;
  organization: string;
  repository: string;
  branch: string;
  auth?: {
    username: string;
    token: string;
  };
}
