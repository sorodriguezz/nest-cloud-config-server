import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { validateRepository } from "./validations.util";
import { RepositoryManager } from "../../config-server/interfaces/repository-manager.interface";
import { IRepositoryUrlBuilder } from "../builders/interfaces/repository-builder.interface";
import type { LoggerLike } from "../logging/config-logger";

export const ensureDirectory = (
  basePath: string,
  repository: string,
  logger?: LoggerLike
): void => {
  const dirPath = getConfigPath(basePath, repository);

  if (!existsSync(dirPath)) {
    logger?.verbose(`Creating directory: ${dirPath}`);
    mkdirSync(dirPath, { recursive: true });
  }
};

export const getConfigPath = (
  pathRepositories: string,
  repository: string
): string => {
  return join(pathRepositories, repository);
};

export const getRepositoryUrl = (
  repository: RepositoryManager,
  urlBuilder: IRepositoryUrlBuilder
): string => {
  validateRepository(repository);

  if (repository.project && urlBuilder.setProject) {
    urlBuilder.setProject(repository.project);
  }

  return urlBuilder
    .setAsPublic(!repository.auth)
    .setCredentials(
      repository.auth?.username || "",
      repository.auth?.token || ""
    )
    .setHost(repository.host)
    .setOrganization(repository.organization)
    .setRepository(repository.repository)
    .build();
};
