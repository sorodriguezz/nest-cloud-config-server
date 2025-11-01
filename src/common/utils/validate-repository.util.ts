import type { RepositoryManager } from "../../config-server/interfaces/repository-manager.interface";

export const validateRepository = (repository: RepositoryManager): void => {
  if (!repository.repository) {
    throw new Error("Repository name is required");
  }
  if (!repository.organization) {
    throw new Error("Organization name is required");
  }
  if (!repository.host) {
    throw new Error("Host is required");
  }
};
