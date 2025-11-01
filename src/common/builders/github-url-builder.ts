import type { IRepositoryUrlBuilder } from "./interfaces/repository-builder.interface";

export class GitHubUrlBuilder implements IRepositoryUrlBuilder {
  private protocol: string = "https://";
  private isPublic: boolean = true;
  private credentials: string = "";
  private host: string = "";
  private organization: string = "";
  private repository: string = "";

  setProtocol(protocol: string): GitHubUrlBuilder {
    this.protocol = protocol.endsWith("://") ? protocol : `${protocol}://`;
    return this;
  }

  setAsPublic(isPublic: boolean = true): GitHubUrlBuilder {
    this.isPublic = isPublic;
    return this;
  }

  setCredentials(username: string, token: string): GitHubUrlBuilder {
    if (!this.isPublic) {
      this.credentials = `${username}:${token}@`;
    }
    return this;
  }

  setHost(host: string): GitHubUrlBuilder {
    this.host = host;
    return this;
  }

  setOrganization(org: string): GitHubUrlBuilder {
    this.organization = org;
    return this;
  }

  setRepository(repo: string): GitHubUrlBuilder {
    this.repository = repo;
    return this;
  }

  build(): string {
    const credentialsPart = this.isPublic ? "" : this.credentials;
    return `${this.protocol}${credentialsPart}${this.host}/${this.organization}/${this.repository}.git`;
  }
}
