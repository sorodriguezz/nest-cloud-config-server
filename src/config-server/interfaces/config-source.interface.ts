import type { ConfigQuery } from "../../common/models/config-query.model";

export interface ConfigSource {
  readonly name?: string;
  getConfig(query: ConfigQuery): Promise<Record<string, any> | null>;
}
