export interface IRepositoryUrlBuilder {
  setProtocol(protocol: string): IRepositoryUrlBuilder;
  setAsPublic(isPublic: boolean): IRepositoryUrlBuilder;
  setCredentials(username: string, token: string): IRepositoryUrlBuilder;
  setHost(host: string): IRepositoryUrlBuilder;
  setOrganization(org: string): IRepositoryUrlBuilder;
  setRepository(repo: string): IRepositoryUrlBuilder;
  build(): string;
}
