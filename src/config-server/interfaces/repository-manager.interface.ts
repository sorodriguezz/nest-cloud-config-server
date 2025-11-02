import type { RepositoryType } from "../../common/factories/enums/repository-type.enum";

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
