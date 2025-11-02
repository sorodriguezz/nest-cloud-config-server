import { AzureUrlBuilder } from "../builders/azure-url.builder";
import { GitHubUrlBuilder } from "../builders/github-url-builder";
import { GitLabUrlBuilder } from "../builders/gitlab-url.builder";
import type { IRepositoryUrlBuilder } from "../builders/interfaces/repository-builder.interface";
import { RepositoryType } from "./enums/repository-type.enum";

type BuilderMap = Partial<
  Record<RepositoryType, new () => IRepositoryUrlBuilder>
>;

export class RepositoryBuilderFactory {
  public getBuilder(type: RepositoryType): IRepositoryUrlBuilder {
    const builders: BuilderMap = {
      [RepositoryType.GITHUB]: GitHubUrlBuilder,
      [RepositoryType.GITLAB]: GitLabUrlBuilder,
      [RepositoryType.AZURE]: AzureUrlBuilder,
    };

    const BuilderCtor = builders[type];

    return new BuilderCtor!();
  }
}
