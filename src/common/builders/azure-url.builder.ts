import type { IRepositoryUrlBuilder } from "./interfaces/repository-builder.interface";

export class AzureUrlBuilder implements IRepositoryUrlBuilder {
  private protocol: string = "https://";
  private isPublic: boolean = true;
  private credentials: string = "";
  private host: string = "dev.azure.com";
  private organization: string = "";
  private project: string = "";
  private repository: string = "";

  setProtocol(protocol: string): AzureUrlBuilder {
    this.protocol = protocol.endsWith("://") ? protocol : `${protocol}://`;
    return this;
  }

  setAsPublic(isPublic: boolean = true): AzureUrlBuilder {
    this.isPublic = isPublic;
    return this;
  }

  setCredentials(username: string, pat: string): AzureUrlBuilder {
    this.credentials = `${username}:${pat}@`;
    return this;
  }

  setHost(host: string): AzureUrlBuilder {
    this.host = host;
    return this;
  }

  setOrganization(org: string): AzureUrlBuilder {
    this.organization = org;
    return this;
  }

  setProject(project: string): AzureUrlBuilder {
    this.project = project;
    return this;
  }

  setRepository(repo: string): AzureUrlBuilder {
    this.repository = repo;
    return this;
  }

  build(): string {
    const credentialsPart = this.isPublic ? "" : this.credentials;
    return `${this.protocol}${credentialsPart}${this.host}/${this.organization}/${this.project}/_git/${this.repository}`;
  }
}
