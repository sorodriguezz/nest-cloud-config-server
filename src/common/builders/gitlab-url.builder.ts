import type { IRepositoryUrlBuilder } from "./interfaces/repository-builder.interface";

export class GitLabUrlBuilder implements IRepositoryUrlBuilder {
  private protocol: string = "https://";
  private isPublic: boolean = true;
  private credentials: string = "";
  private host: string = "gitlab.com";
  private organization: string = "";
  private repository: string = "";

  setProtocol(protocol: string): GitLabUrlBuilder {
    this.protocol = protocol.endsWith("://") ? protocol : `${protocol}://`;
    return this;
  }

  setAsPublic(isPublic: boolean = true): GitLabUrlBuilder {
    this.isPublic = isPublic;
    return this;
  }

  setCredentials(username: string, token: string): GitLabUrlBuilder {
    if (!this.isPublic) {
      this.credentials = `${username}:${token}@`;
    }
    return this;
  }

  setHost(host: string): GitLabUrlBuilder {
    this.host = host;
    return this;
  }

  setOrganization(org: string): GitLabUrlBuilder {
    this.organization = org;
    return this;
  }

  setRepository(repo: string): GitLabUrlBuilder {
    this.repository = repo;
    return this;
  }

  build(): string {
    const credentialsPart = this.isPublic ? "" : this.credentials;
    return `${this.protocol}${credentialsPart}${this.host}/${this.organization}/${this.repository}.git`;
  }
}
